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
	[token] varchar(16) null,
	[name] nvarchar(32) null,
	[role] varchar(8) not null,
	[key] integer null,
	constraint [role] check([role] in ('admin', 'user'))
)
go
create table posts
(
	[id] integer primary key identity,
	[title] nvarchar(32) not null unique,
	[text] nvarchar(max) not null,
	[date] datetime not null default getdate() 
)
go
create table comments
(
	[id] integer primary key identity,
	[post] integer foreign key references posts(id),
	[author] integer foreign key references users(id),
	[text] nvarchar(2048) not null
)