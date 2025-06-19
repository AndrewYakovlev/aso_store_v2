-- SQL скрипт для создания базы данных и пользователя
-- Выполнять от имени postgres: sudo -u postgres psql

-- Создание пользователя
CREATE USER aso_user WITH PASSWORD 'your_secure_password_here';

-- Создание базы данных
CREATE DATABASE aso_store_prod OWNER aso_user;

-- Предоставление всех прав
GRANT ALL PRIVILEGES ON DATABASE aso_store_prod TO aso_user;

-- Подключение к базе данных
\c aso_store_prod;

-- Предоставление прав на схему
GRANT ALL ON SCHEMA public TO aso_user;