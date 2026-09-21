select id, status_code, content_type, left(content, 200) as content, created
from net._http_response
order by id desc
limit 6;
