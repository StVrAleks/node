-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Хост: 127.0.0.1
-- Время создания: Июн 29 2025 г., 12:06
-- Версия сервера: 10.4.32-MariaDB
-- Версия PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- База данных: `flowerida_db`
--

-- --------------------------------------------------------

--
-- Структура таблицы `baskets`
--

CREATE TABLE `baskets` (
  `id` int(11) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `userId` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Дамп данных таблицы `baskets`
--

INSERT INTO `baskets` (`id`, `createdAt`, `updatedAt`, `userId`) VALUES
(1, '2025-06-21 10:52:50', '2025-06-21 10:52:50', 5);

-- --------------------------------------------------------

--
-- Структура таблицы `basket_flowers`
--

CREATE TABLE `basket_flowers` (
  `id` int(11) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `basketId` int(11) DEFAULT NULL,
  `userId` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `flowers`
--

CREATE TABLE `flowers` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `price` int(11) NOT NULL,
  `flowerVidId` int(11) DEFAULT NULL,
  `mKeyWords` varchar(255) DEFAULT NULL,
  `mDiscript` varchar(255) DEFAULT NULL,
  `basketFlowerId` int(11) DEFAULT NULL,
  `flowerLikeId` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Дамп данных таблицы `flowers`
--

INSERT INTO `flowers` (`id`, `name`, `price`, `flowerVidId`, `mKeyWords`, `mDiscript`, `basketFlowerId`, `flowerLikeId`, `createdAt`, `updatedAt`) VALUES
(5, 'Тюльпан красный', 10, 1, 'цветок растение тюльпан', 'цветок растение тюльпан', NULL, NULL, '2025-06-28 18:31:57', '2025-06-29 07:55:05'),
(6, 'Гладиолус обыкновенный ', 15, 4, 'Гладиолус обыкновенный ', 'Гладиолус обыкновенный ', NULL, NULL, '2025-06-28 18:34:07', '2025-06-28 18:34:07'),
(7, 'Роза чайно-гибридная', 15, 5, 'цветок Роза чайно-гибридная', 'растение Роза чайно-гибридная', NULL, NULL, '2025-06-28 18:35:28', '2025-06-28 18:43:43'),
(8, 'Пион травянистый (или кустовый)', 15, 6, 'цветок пион', 'растение пион ', NULL, NULL, '2025-06-28 18:43:29', '2025-06-28 20:35:07'),
(9, 'Альстромерия', 25, 7, 'Альстромерия растение цветок', 'Альстромерия растение цветок', NULL, NULL, '2025-06-28 19:33:56', '2025-06-28 19:33:56'),
(10, 'Ромашка садовая', 5, 8, 'Ромашка садовая растение цветок', 'Ромашка садовая растение цветок', NULL, NULL, '2025-06-28 19:34:38', '2025-06-28 19:44:52'),
(11, 'Астра многолетняя', 10, 9, 'Астра многолетняя цветок растение', 'Астра многолетняя цветок растение', NULL, NULL, '2025-06-28 19:51:11', '2025-06-28 19:51:11'),
(12, 'Нарцисс махровый', 15, 10, 'Нарцисс махровый растение цветок', 'Нарцисс махровый растение цветок', NULL, NULL, '2025-06-28 19:54:01', '2025-06-28 19:54:01'),
(13, 'Хризантема Баккарди', 15, 11, 'хризантема растение цветок', 'хризантема растение цветок', NULL, NULL, '2025-06-28 19:56:38', '2025-06-28 19:56:38');

-- --------------------------------------------------------

--
-- Структура таблицы `flower_imgs`
--

CREATE TABLE `flower_imgs` (
  `id` int(11) NOT NULL,
  `num` int(11) DEFAULT NULL,
  `img` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `flowerId` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Дамп данных таблицы `flower_imgs`
--

INSERT INTO `flower_imgs` (`id`, `num`, `img`, `createdAt`, `updatedAt`, `flowerId`) VALUES
(20, NULL, 'file-1751182157929-244234191.jpg', '2025-06-29 07:29:18', '2025-06-29 07:29:18', 5),
(21, NULL, 'file-1751182168214-603334455.jpg', '2025-06-29 07:29:28', '2025-06-29 07:29:28', 5),
(22, NULL, 'file-1751182181691-272272453.jpg', '2025-06-29 07:29:42', '2025-06-29 07:29:42', 6),
(23, NULL, 'file-1751182190534-991224901.jpg', '2025-06-29 07:29:51', '2025-06-29 07:29:51', 6),
(24, NULL, 'file-1751182232053-771165429.jpg', '2025-06-29 07:30:32', '2025-06-29 07:30:32', 7),
(25, NULL, 'file-1751182240880-195467954.jpg', '2025-06-29 07:30:41', '2025-06-29 07:30:41', 7),
(26, NULL, 'file-1751182249342-930707228.jpg', '2025-06-29 07:30:50', '2025-06-29 07:30:50', 7),
(27, NULL, 'file-1751182335466-305675932.jpg', '2025-06-29 07:32:16', '2025-06-29 07:32:16', 8),
(28, NULL, 'file-1751182342982-945733109.jpg', '2025-06-29 07:32:23', '2025-06-29 07:32:23', 8),
(29, NULL, 'file-1751182407647-18074122.jpg', '2025-06-29 07:33:28', '2025-06-29 07:33:28', 9),
(30, NULL, 'file-1751182414424-180469733.jpg', '2025-06-29 07:33:35', '2025-06-29 07:33:35', 9),
(31, NULL, 'file-1751182472974-423942479.jpg', '2025-06-29 07:34:33', '2025-06-29 07:34:33', 10),
(32, NULL, 'file-1751182483157-53980626.jpg', '2025-06-29 07:34:43', '2025-06-29 07:34:43', 10),
(33, NULL, 'file-1751182567579-371385603.jpg', '2025-06-29 07:36:08', '2025-06-29 07:36:08', 11),
(34, NULL, 'file-1751182576587-93339356.jpg', '2025-06-29 07:36:17', '2025-06-29 07:36:17', 11),
(35, NULL, 'file-1751182633159-557348463.jpg', '2025-06-29 07:37:13', '2025-06-29 07:37:13', 12),
(36, NULL, 'file-1751182640359-460710040.jpg', '2025-06-29 07:37:20', '2025-06-29 07:37:20', 12),
(37, NULL, 'file-1751182708796-235520217.jpg', '2025-06-29 07:38:29', '2025-06-29 07:38:29', 13),
(38, NULL, 'file-1751182717133-381325979.jpg', '2025-06-29 07:38:37', '2025-06-29 07:38:37', 13);

-- --------------------------------------------------------

--
-- Структура таблицы `flower_imgs_fs`
--

CREATE TABLE `flower_imgs_fs` (
  `id` int(11) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `flower_infos`
--

CREATE TABLE `flower_infos` (
  `id` int(11) NOT NULL,
  `flowerId` int(11) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `discription` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Дамп данных таблицы `flower_infos`
--

INSERT INTO `flower_infos` (`id`, `flowerId`, `title`, `discription`, `createdAt`, `updatedAt`) VALUES
(48, 7, 'Свет.', 'Эти цветы любят обилие света, поэтому участок под розарий надо выбирать солнечный. Но! Если кусты будут на палящем солнце с утра до ночи, это скажется на их декоративности – в полдень на жаре цветки подгорают, спекаются, теряют свою окраску и сроки цветен', '2025-06-28 18:37:55', '2025-06-28 18:37:55'),
(49, 7, 'Полив', 'Поливать розы надо начинать с середины мая – к этому времени почва обычно уже просыхает. Полива им достаточно 1 раз в неделю. Норма такая:\n\nпод кусты средних размеров – 1 ведро на куст;\nпод крупные растения и плетистые розы – 2 ведра на куст.', '2025-06-28 18:37:55', '2025-06-28 18:37:55'),
(50, 7, 'Влажность почвы. ', 'Розы не переносят застоя воды, поэтому им не годятся низины, где будут скапливаться талые и дождевые воды. Не подойдут для них и заболоченные участки.', '2025-06-28 18:37:55', '2025-06-28 18:37:55'),
(51, 9, 'Правила посадки', 'Прежде чем приступать к высадке семян, их необходимо подготовить особым образом. Для начала заверните посевной материал в смоченную в воде ткань и поставьте в таком виде в холодильник на 1 месяц. Далее займитесь подготовкой почвы. Она должна быть богатой ', '2025-06-28 19:46:41', '2025-06-28 19:46:41'),
(52, 9, 'Уход за альстромерией', 'Ухаживать за перуанской лилией достаточно легко, необходимо вовремя поливать растение, рыхлить верхний слой грунта, вырывать сорняки, а также правильно готовить культуру к зимовке, если она растет не в комнатном горшке. Если вам знаком уход за амариллисом', '2025-06-28 19:46:41', '2025-06-28 19:46:41'),
(53, 9, 'Местоположение', 'Участок для перуанских лилий должен быть хорошо освещенным утром или вечером и окруженным защитой от ветров и сквозняков. Палящие полуденные лучи могут спровоцировать ожоги на нежных лепестках и листьях.', '2025-06-28 19:46:41', '2025-06-28 19:46:41'),
(54, 8, 'Травянистое растение:', 'Пионы обычно относятся к травянистым многолетникам, но существуют также древовидные формы', '2025-06-28 19:47:43', '2025-06-28 20:35:13'),
(55, 8, 'Размер и форма:', 'Стебли могут быть от 40 до 80 см в высоту у травянистых форм, и до 2 метров у древовидных. Цветки крупные, одиночные или собранные в соцветия. ', '2025-06-28 19:47:43', '2025-06-28 20:35:13'),
(56, 6, 'Описание', 'Это многолетние цветы , которые в холодном климате необходимо выкапывать и хранить на зиму. Хотя многие считают, что у гладиолуса есть луковица, на самом деле это клубнелуковица. Цветы гладиолуса несут в себе значение силы характера, памяти, верности и мо', '2025-06-28 19:48:36', '2025-06-28 19:48:36'),
(57, 10, 'Описание', 'Ромашка садовая (другое научное название – нивяник) – травянистый многолетник, принадлежащий к семейству Астровые. Представляет собой довольно мощный куст высотой от 20 до 90 см (в зависимости от сорта). Листья ярко-зеленые, продолговатые, зубчатые.', '2025-06-28 19:49:21', '2025-06-28 19:49:21'),
(58, 12, 'Описание', 'это род многолетних луковичных растений семейства Амариллисовые, насчитывающий более 50 видов и множество гибридов. Они широко известны своими красивыми, часто ароматными цветками, которые бывают разных форм и окрасок. ', '2025-06-28 19:54:34', '2025-06-28 19:54:34'),
(59, 13, 'Описание', 'кустовая хризантема, часто называемая флористами \"ромашковой\" за внешнее сходство с полевыми ромашками. Она отличается небольшими цветками (5-7 см в диаметре), чаще всего белого цвета с зеленоватой сердцевиной, но также встречаются желтые, розовые и други', '2025-06-28 19:56:47', '2025-06-28 19:56:47');

-- --------------------------------------------------------

--
-- Структура таблицы `flower_info_fs`
--

CREATE TABLE `flower_info_fs` (
  `id` int(11) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `flower_likes`
--

CREATE TABLE `flower_likes` (
  `id` int(11) NOT NULL,
  `flag` int(11) NOT NULL DEFAULT 0,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `userId` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `flower_vids`
--

CREATE TABLE `flower_vids` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Дамп данных таблицы `flower_vids`
--

INSERT INTO `flower_vids` (`id`, `name`, `createdAt`, `updatedAt`) VALUES
(1, 'Тюльпан', '2025-06-23 17:42:57', '2025-06-28 16:05:59'),
(4, 'Гладиолус', '2025-06-28 15:54:32', '2025-06-28 15:54:32'),
(5, 'Роза', '2025-06-28 15:57:10', '2025-06-28 15:57:10'),
(6, 'Пион', '2025-06-28 15:57:26', '2025-06-28 16:06:35'),
(7, 'Альстромерия', '2025-06-28 15:57:41', '2025-06-28 16:06:48'),
(8, 'Ромашка', '2025-06-28 15:57:50', '2025-06-28 15:57:50'),
(9, 'Астра', '2025-06-28 15:58:07', '2025-06-28 16:08:02'),
(10, 'Нарцисс', '2025-06-28 16:15:01', '2025-06-28 16:15:25'),
(11, 'Хризантема', '2025-06-28 18:16:18', '2025-06-28 18:16:18'),
(12, 'Крокус', '2025-06-28 18:16:18', '2025-06-28 18:16:18'),
(13, 'Клематис', '2025-06-28 16:23:18', '2025-06-28 16:23:18'),
(14, 'Астильба', '2025-06-28 16:28:11', '2025-06-28 16:28:11'),
(15, 'Люпин', '2025-06-28 16:29:57', '2025-06-28 16:29:57'),
(16, 'Флокс', '2025-06-28 16:30:11', '2025-06-28 16:30:11'),
(17, 'Петуния', '2025-06-28 16:30:31', '2025-06-28 16:30:31'),
(18, 'Бархатцы', '2025-06-28 16:30:54', '2025-06-28 16:30:54'),
(19, 'Стрелиция', '2025-06-28 16:31:06', '2025-06-28 16:31:06'),
(20, 'Фрезия', '2025-06-28 16:31:26', '2025-06-28 16:31:26'),
(21, 'Гиацинт', '2025-06-28 16:31:40', '2025-06-28 16:31:40'),
(22, 'Гладиолус', '2025-06-28 16:31:54', '2025-06-28 16:31:54'),
(23, 'Ирис', '2025-06-28 16:32:03', '2025-06-28 16:32:03'),
(25, 'Маргаритка', '2025-06-28 16:32:17', '2025-06-28 16:32:17'),
(26, 'Незабудка', '2025-06-28 16:32:51', '2025-06-28 16:32:51'),
(27, 'Ромашка', '2025-06-28 16:33:03', '2025-06-28 16:33:03'),
(28, 'Цикламен', '2025-06-28 16:33:13', '2025-06-28 16:33:13'),
(29, 'Циния', '2025-06-28 16:33:22', '2025-06-28 16:33:22'),
(30, 'Эдельвейс', '2025-06-28 16:33:38', '2025-06-28 16:33:38'),
(31, 'Колокольчик', '2025-06-28 16:33:48', '2025-06-28 16:33:48'),
(32, 'Примула', '2025-06-28 16:34:57', '2025-06-28 16:34:57'),
(33, 'Ранункулюс', '2025-06-28 16:35:13', '2025-06-28 16:35:13'),
(34, 'Лилия', '2025-06-28 16:35:39', '2025-06-28 16:35:39'),
(35, 'Гортензия', '2025-06-28 16:37:46', '2025-06-28 16:37:46'),
(36, 'Аквилегия', '2025-06-28 17:46:08', '2025-06-28 17:46:08');

-- --------------------------------------------------------

--
-- Структура таблицы `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `user_status` varchar(255) DEFAULT 'disable',
  `role` varchar(255) DEFAULT 'USER',
  `created_user` int(11) DEFAULT 1750970050,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Дамп данных таблицы `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `user_status`, `role`, `created_user`, `createdAt`, `updatedAt`) VALUES
(5, 'vera', 'orchid86@yandex.ru', '658e44d3e8cce564090ba26329283a182a474cb07c1f8acc892ac6838a6c922d', 'enable', 'ADMIN', 1750495575, '2025-06-21 08:46:32', '2025-06-21 09:43:53'),
(9, 'vera', 'svera@mogilev.by', '658e44d3e8cce564090ba26329283a182a474cb07c1f8acc892ac6838a6c922d', 'disable', 'USER', 1750517587, '2025-06-21 14:53:25', '2025-06-22 19:17:08');

--
-- Индексы сохранённых таблиц
--

--
-- Индексы таблицы `baskets`
--
ALTER TABLE `baskets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`);

--
-- Индексы таблицы `basket_flowers`
--
ALTER TABLE `basket_flowers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `basketId` (`basketId`),
  ADD KEY `userId` (`userId`);

--
-- Индексы таблицы `flowers`
--
ALTER TABLE `flowers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `flowerVidId` (`flowerVidId`),
  ADD KEY `basketFlowerId` (`basketFlowerId`),
  ADD KEY `flowerLikeId` (`flowerLikeId`);

--
-- Индексы таблицы `flower_imgs`
--
ALTER TABLE `flower_imgs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `flowerId` (`flowerId`);

--
-- Индексы таблицы `flower_imgs_fs`
--
ALTER TABLE `flower_imgs_fs`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `flower_infos`
--
ALTER TABLE `flower_infos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `flowerId` (`flowerId`);

--
-- Индексы таблицы `flower_info_fs`
--
ALTER TABLE `flower_info_fs`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `flower_likes`
--
ALTER TABLE `flower_likes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`);

--
-- Индексы таблицы `flower_vids`
--
ALTER TABLE `flower_vids`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `email_2` (`email`),
  ADD UNIQUE KEY `email_3` (`email`),
  ADD UNIQUE KEY `email_4` (`email`),
  ADD UNIQUE KEY `email_5` (`email`),
  ADD UNIQUE KEY `email_6` (`email`),
  ADD UNIQUE KEY `email_7` (`email`),
  ADD UNIQUE KEY `email_8` (`email`),
  ADD UNIQUE KEY `email_9` (`email`),
  ADD UNIQUE KEY `email_10` (`email`),
  ADD UNIQUE KEY `email_11` (`email`),
  ADD UNIQUE KEY `email_12` (`email`),
  ADD UNIQUE KEY `email_13` (`email`),
  ADD UNIQUE KEY `email_14` (`email`),
  ADD UNIQUE KEY `email_15` (`email`),
  ADD UNIQUE KEY `email_16` (`email`),
  ADD UNIQUE KEY `email_17` (`email`),
  ADD UNIQUE KEY `email_18` (`email`),
  ADD UNIQUE KEY `email_19` (`email`),
  ADD UNIQUE KEY `email_20` (`email`),
  ADD UNIQUE KEY `email_21` (`email`),
  ADD UNIQUE KEY `email_22` (`email`),
  ADD UNIQUE KEY `email_23` (`email`),
  ADD UNIQUE KEY `email_24` (`email`),
  ADD UNIQUE KEY `email_25` (`email`),
  ADD UNIQUE KEY `email_26` (`email`),
  ADD UNIQUE KEY `email_27` (`email`),
  ADD UNIQUE KEY `email_28` (`email`),
  ADD UNIQUE KEY `email_29` (`email`),
  ADD UNIQUE KEY `email_30` (`email`),
  ADD UNIQUE KEY `email_31` (`email`),
  ADD UNIQUE KEY `email_32` (`email`),
  ADD UNIQUE KEY `email_33` (`email`),
  ADD UNIQUE KEY `email_34` (`email`),
  ADD UNIQUE KEY `email_35` (`email`),
  ADD UNIQUE KEY `email_36` (`email`),
  ADD UNIQUE KEY `email_37` (`email`),
  ADD UNIQUE KEY `email_38` (`email`),
  ADD UNIQUE KEY `email_39` (`email`),
  ADD UNIQUE KEY `email_40` (`email`),
  ADD UNIQUE KEY `email_41` (`email`),
  ADD UNIQUE KEY `email_42` (`email`),
  ADD UNIQUE KEY `email_43` (`email`),
  ADD UNIQUE KEY `email_44` (`email`),
  ADD UNIQUE KEY `email_45` (`email`),
  ADD UNIQUE KEY `email_46` (`email`),
  ADD UNIQUE KEY `email_47` (`email`),
  ADD UNIQUE KEY `email_48` (`email`),
  ADD UNIQUE KEY `email_49` (`email`),
  ADD UNIQUE KEY `email_50` (`email`),
  ADD UNIQUE KEY `email_51` (`email`),
  ADD UNIQUE KEY `email_52` (`email`),
  ADD UNIQUE KEY `email_53` (`email`),
  ADD UNIQUE KEY `email_54` (`email`),
  ADD UNIQUE KEY `email_55` (`email`),
  ADD UNIQUE KEY `email_56` (`email`),
  ADD UNIQUE KEY `email_57` (`email`),
  ADD UNIQUE KEY `email_58` (`email`),
  ADD UNIQUE KEY `email_59` (`email`),
  ADD UNIQUE KEY `email_60` (`email`),
  ADD UNIQUE KEY `email_61` (`email`),
  ADD UNIQUE KEY `email_62` (`email`),
  ADD UNIQUE KEY `email_63` (`email`);

--
-- AUTO_INCREMENT для сохранённых таблиц
--

--
-- AUTO_INCREMENT для таблицы `baskets`
--
ALTER TABLE `baskets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT для таблицы `basket_flowers`
--
ALTER TABLE `basket_flowers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `flowers`
--
ALTER TABLE `flowers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT для таблицы `flower_imgs`
--
ALTER TABLE `flower_imgs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- AUTO_INCREMENT для таблицы `flower_imgs_fs`
--
ALTER TABLE `flower_imgs_fs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `flower_infos`
--
ALTER TABLE `flower_infos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=60;

--
-- AUTO_INCREMENT для таблицы `flower_info_fs`
--
ALTER TABLE `flower_info_fs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `flower_likes`
--
ALTER TABLE `flower_likes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `flower_vids`
--
ALTER TABLE `flower_vids`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT для таблицы `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- Ограничения внешнего ключа сохраненных таблиц
--

--
-- Ограничения внешнего ключа таблицы `baskets`
--
ALTER TABLE `baskets`
  ADD CONSTRAINT `baskets_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Ограничения внешнего ключа таблицы `basket_flowers`
--
ALTER TABLE `basket_flowers`
  ADD CONSTRAINT `basket_flowers_ibfk_128` FOREIGN KEY (`basketId`) REFERENCES `baskets` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `basket_flowers_ibfk_129` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Ограничения внешнего ключа таблицы `flowers`
--
ALTER TABLE `flowers`
  ADD CONSTRAINT `flowers_ibfk_175` FOREIGN KEY (`flowerVidId`) REFERENCES `flower_vids` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `flowers_ibfk_176` FOREIGN KEY (`basketFlowerId`) REFERENCES `basket_flowers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `flowers_ibfk_177` FOREIGN KEY (`flowerLikeId`) REFERENCES `flower_likes` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Ограничения внешнего ключа таблицы `flower_imgs`
--
ALTER TABLE `flower_imgs`
  ADD CONSTRAINT `flower_imgs_ibfk_1` FOREIGN KEY (`flowerId`) REFERENCES `flowers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Ограничения внешнего ключа таблицы `flower_infos`
--
ALTER TABLE `flower_infos`
  ADD CONSTRAINT `flower_infos_ibfk_1` FOREIGN KEY (`flowerId`) REFERENCES `flowers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Ограничения внешнего ключа таблицы `flower_likes`
--
ALTER TABLE `flower_likes`
  ADD CONSTRAINT `flower_likes_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
