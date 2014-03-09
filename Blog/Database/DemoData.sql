use blog
go
-- posts data
insert into posts values ('Post one', 'This is post content.', '1-2-2013')
insert into posts values ('Post two', 'This is another post content.', '3-2-2014')
-- users data
insert into users values ('admin', 'quorum', 'QUORUM', 'admin')
insert into users values ('sa', 'Aw34esz', 'Acumatica', 'user')
-- comments data
insert into comments values (1, 1, 'Comment content')
insert into comments values (2, 2, 'Another comment');