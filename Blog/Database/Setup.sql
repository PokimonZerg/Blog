--create database blog
go
use blog
go
drop table posts
go
create table posts
(
	[id] integer primary key identity,
	[title] nvarchar(32) not null,
	[text] nvarchar(max) not null,
	[date] datetime not null default getdate() 
)