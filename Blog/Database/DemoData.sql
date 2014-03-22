use blog
go
-- posts data
insert into posts values ('Post one', 'This is post content.', '1-2-2013')
insert into posts values ('Post two', 'This is another post content.', '3-2-2014')
-- users data
insert into users values ('admin', 'quorum', null, 'admin', 'b4049b34-0c72-4f09-adab-1f7e245827ad')
insert into users values ('sa', 'Aw34esz', null, 'user', '6f263a8b-6439-41f0-8351-1c73e3ec6f5f')
-- comments data
insert into comments values (1, 1, 'Comment content')
insert into comments values (2, 2, 'Another comment');