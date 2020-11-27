CREATE DATABASE test CHARACTER SET utf8 COLLATE utf8_general_ci;

create table tb_user (
    id varchar(8) not null primary key,
    pass varchar(256) not null,
    name varchar(32) not null,
    status tinyint not null,
    last_update timestamp default current_timestamp
);

insert into tb_user (id, pass, name, status) values('SH001', '827ccb0eea8a706c4c34a16891f84e7b', 'Rachel Karen Green', 0);
insert into tb_user (id, pass, name, status) values('SH002', '827ccb0eea8a706c4c34a16891f84e7b', 'Monica Geller-Bing', 0);
insert into tb_user (id, pass, name, status) values('SH003', '827ccb0eea8a706c4c34a16891f84e7b', 'Phoebe Buffay-Hannigan', 0);
insert into tb_user (id, pass, name, status) values('SH004', '827ccb0eea8a706c4c34a16891f84e7b', 'Chandler Muriel Bing',  0);
insert into tb_user (id, pass, name, status) values('SH005', '827ccb0eea8a706c4c34a16891f84e7b', 'Ross Geller', 0);
insert into tb_user (id, pass, name, status) values('SH006', '827ccb0eea8a706c4c34a16891f84e7b', 'Michael Tribbiani', 1);
insert into tb_user (id, pass, name, status) values('SH007', '827ccb0eea8a706c4c34a16891f84e7b', 'Alice', 0);
insert into tb_user (id, pass, name, status) values('SH008', '827ccb0eea8a706c4c34a16891f84e7b', 'Jack', 0);
insert into tb_user (id, pass, name, status) values('SH009', '827ccb0eea8a706c4c34a16891f84e7b', 'Rose', 0);
insert into tb_user (id, pass, name, status) values('SH010', '827ccb0eea8a706c4c34a16891f84e7b', 'Gloria', 0);
insert into tb_user (id, pass, name, status) values('SH011', '827ccb0eea8a706c4c34a16891f84e7b', 'Douglas', 0);
insert into tb_user (id, pass, name, status) values('SH012', '827ccb0eea8a706c4c34a16891f84e7b', 'James', 0);

create table tb_timeclock (
    id bigint(20) primary key AUTO_INCREMENT,
    user_id varchar(8) not null,
    clock_type tinyint,
    clock_time timestamp default current_timestamp,
    foreign key fk_user(user_id) references tb_user (id)
);

