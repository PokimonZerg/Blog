use blog
go
drop table comments
go
drop table users
go
drop table posts
go
create table users
(
	[id] integer primary key identity,
	[login] varchar(16) null,
	[password] varchar(16) null,
	[token] varchar(32) null,
	[role] varchar(8) not null,
	[key] varchar(38) not null,
	constraint [role] check([role] in ('admin', 'user'))
)
go
create table posts
(
	[id] integer primary key identity,
	[short_title] nvarchar(16) not null,
	[title] nvarchar(128) not null,
	[text] nvarchar(max) not null,
	[date] datetime not null
)
go
create table comments
(
	[id] integer primary key identity,
	[post] integer foreign key references posts(id),
	[author] integer foreign key references users(id),
	[text] nvarchar(2048) not null
)