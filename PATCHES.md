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

0) Ставим yarn (желательно через него, тут и yarn.lock в дирректории)
1) Могут возникнуть проблемы с ssl, это можно отключить при сборке
* для npm
  * npm config set strict-ssl false
  * не забываем вернуть флаг обратно
* для yarn
  * команда yarn config set "strict-ssl" false -g
  * не забываем вернуть флаг обратно
* для node
  * я запускал сборку через git bash командную строку
  * команда export NODE_TLS_REJECT_UNAUTHORIZED=0 && yarn install

2) Необходима установка java, я просто поставил стабильную jre.

3) запускаем yarn run build-amd

4) собираются только файлы React/third-party/* с окончаниями development, production, profiling. 
А используются файлы без окончаний. 
Я обновил руками,
например скопировал react-dom.development.js в react-dom.js,
а react-dom.production.min.js в react-dom.min.js.
При необходимости обновляем.
<b>Вероятно по хорошему надо поправить скрипт сборки, чтобы сразу все нормально собиралось.</b>

