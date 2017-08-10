@echo off
(
browserify -r ./picognizer.js:picognizer -o picognizer_browser.js
)
pause
