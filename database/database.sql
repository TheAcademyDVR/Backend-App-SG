create table users(
    id int primary key AUTO_INCREMENT,
    name varchar(250),
    contact varchar(20),
    email varchar(100),
    password varchar(250),
    status varchar(20),
    role varche(20),
    UNIQUE (email)
)

insert into users(name, contact, email, password, status, role) 
value('THE ACADEMY DVR', '0994340401', 'theacademy.dvr@gmail.com', 'admin123', 'true', 'admin');


create table category(
    id int not null AUTO_INCREMENT,
    name varchar(250) not null,
    primary key(id)
)

create table product (
    id int NOT NULL AUTO_INCREMENT,
    name varchar(255) NOT NULL,
    categoryId integer NOT NULL,
    description varchar(255), 
    price integer,
    status varchar(20),
    primary key(id)
)

create table bill (
    id int not null AUTO_INCREMENT,
    uuid varchar(200) not null,
    name varchar(255) not null,
    email varchar(100) not null,
    contact varchar(20) not null,
    paymentMethod varchar(50) not null,
    total int not null,
    productDetails JSON DEFAULT NULL,
    createdBy varchar(100) not null,
    primary key (id)
)