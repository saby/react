# Список патчей

* Object.defineProperty для глобального объекта ReactSharedInternals
и для поля ReactCurrentDispatcher.current + WarningMsg(requestUuid) в renderToString
[ссылка на МР](https://online.sbis.ru/opendoc.html?guid=887715ab-ba5d-4b4e-b056-929191356f2e)
* LogMsg(requestUuid) в renderToString [ссылка на МР](https://online.sbis.ru/opendoc.html?guid=6d52b651-9bde-4705-ac8e-10b52c051b02)
* enumerable: true [ссылка на МР](https://online.sbis.ru/opendoc.html?guid=b447e510-66ad-469f-b9b9-a8b08adf30dd&client=3)
* s в конце _requestUuids [ссылка на МР](https://online.sbis.ru/opendoc.html?guid=29acd5b4-9425-444d-8535-5778496688c6)
* файл санитизации урла (packages/react-dom/src/shared/sanitizeURL.js) в подверженных xss атрибутах обновлен и теперь есть защита [ссылка на МР](https://online.sbis.ru/opendoc.html?guid=35717a31-f2e8-4a7b-aea4-0dade57661d1&client=3)
* пометил предупреждения реакта (префикс в текст ошибок), чтобы их проще было отличать от других ошибок. а именно:
  * react-dom error!
  * react error!
  * react-reconciler error!
  * hydration error!

# Как запустить build без проблем

Все рекомандации только для Windows.

1) Подготовка 

- Проверяем версию ноды - проверялось на 18.18.0 (управлять версиями можно через nvm)
- Ставим yarn (ОБЯЗАТЕЛЬНО, через него устанавливаются зависимости самого реакта)
- Устанавливаем java https://www.java.com/en/download/manual.jsp (это нужно для работы мнификатора из сборки react)
- Не забываем перезапустить консоль после установки jre
- Запускаем init из корня (npm run init:*version*)

2) Правим исходные файлы реакта в react-source/*версия реакта*/packages 

3) Запускаем сборку (из корневой директории)
- yarn build:17
- yarn build:19

<b>В 17-й версии не собирается react-dom/client и react-dom/server</b>

