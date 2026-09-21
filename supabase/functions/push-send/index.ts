// Mobily Bro — push-send Edge Function
// Invoked by the database webhook on notifications INSERT.
// Sends a Web Push to every subscribed device via the VAPID keys stored in secrets.
import webpush from 'npm:web-push@3.6.7'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

webpush.setVapidDetails(
  Deno.env.get('VAPID_SUBJECT') ?? 'mailto:rainman180.ayman@gmail.com',
  Deno.env.get('VAPID_PUBLIC_KEY')!,
  Deno.env.get('VAPID_PRIVATE_KEY')!,
)

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  try {
    const body = await req.json().catch(() => null)
    const record = body?.record ?? body
    const notificationId = record?.id
    if (!notificationId) {
      return new Response(JSON.stringify({ ok: false, reason: 'no notification id' }), {
        status: 400,
        headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    // verify the notification actually exists (blocks random invocation abuse)
    const nRes = await fetch(
      `${supabaseUrl}/rest/v1/notifications?select=title,body,image_url,product_id&id=eq.${notificationId}&limit=1`,
      { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } }
    )
    const notifications = await nRes.json()
    const notif = notifications?.[0]
    if (!notif) {
      return new Response(JSON.stringify({ ok: false, reason: 'unknown notification' }), {
        status: 404,
        headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    // gather subscriptions
    const sRes = await fetch(`${supabaseUrl}/rest/v1/push_subscriptions?select=endpoint,p256dh,auth`, {
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
    })
    const subs = await sRes.json()
    if (!Array.isArray(subs) || subs.length === 0) {
      return new Response(JSON.stringify({ ok: true, sent: 0, removed: 0 }), {
        headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    const payload = JSON.stringify({
      title: notif.title,
      body: notif.body || '',
      icon: notif.image_url || '/icons/icon-192.png',
      url: notif.product_id ? '/product/' + notif.product_id : '/notifications',
    })

    let sent = 0
    const stale: string[] = []
    await Promise.all(
      subs.map(async (s: { endpoint: string; p256dh: string; auth: string }) => {
        try {
          await webpush.sendNotification(
            { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
            payload
          )
          sent++
        } catch (err) {
          const status = (err as { statusCode?: number })?.statusCode
          if (status === 404 || status === 410) stale.push(s.endpoint)
        }
      })
    )

    if (stale.length) {
      await fetch(
        `${supabaseUrl}/rest/v1/push_subscriptions?endpoint=in.(${stale.map((e) => `"${e}"`).join(',')})`,
        { method: 'DELETE', headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } }
      )
    }

    return new Response(JSON.stringify({ ok: true, sent, removed: stale.length }), {
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500,
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  }
})
