USE master;
GO

IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'MusicAppDB')
BEGIN
    CREATE DATABASE MusicAppDB;
END
