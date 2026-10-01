-- Version JSON pour ton cas (tu utilises database.json pas MySQL)
-- Si tu passes sur MySQL plus tard, voici la structure :

CREATE TABLE users (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100),
  phone VARCHAR(20) UNIQUE,
  email VARCHAR(100),
  password VARCHAR(255),
  solde INT DEFAULT 0,
  points INT DEFAULT 0,
  referralCode VARCHAR(20) UNIQUE,
  referredBy VARCHAR(20),
  role ENUM('user','admin') DEFAULT 'user',
  currentVip VARCHAR(20),
  createdAt DATETIME
);

CREATE TABLE investments (
  id VARCHAR(50) PRIMARY KEY,
  userId VARCHAR(50),
  amount INT,
  plan VARCHAR(50),
  dailyGain INT,
  status ENUM('active','finished') DEFAULT 'active',
  createdAt DATETIME
);

CREATE TABLE transactions (
  id VARCHAR(50) PRIMARY KEY,
  userId VARCHAR(50),
  type ENUM('depot','retrait','bonus_parrain','gain_journalier','achat_vip'),
  amount INT,
  status ENUM('pending','approved','rejected') DEFAULT 'pending',
  preuve VARCHAR(255),
  createdAt DATETIME
);