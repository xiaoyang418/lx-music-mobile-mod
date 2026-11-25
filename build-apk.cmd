@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM ============================================================
REM  LX Music 移动版一键打包脚本
REM  作用：把源码目录的改动同步到本构建目录，然后打包 release APK
REM
REM  为什么要有这个目录：
REM    原项目路径 D:\lx music\... 含有空格，部分原生库与 AGP 在带空格
REM    的路径下会报 Invalid file path，因此把源码复制到本目录（无空格）构建。
REM ============================================================

set "SRC=D:\lx music\lx-music-mobile-1.9.2\lx-music-mobile-1.9.2"
set "DST=%~dp0"
set "JAVA_HOME=D:\RUANJIAN\Android\AndroidStudioCJ\jbr"

echo [1/3] 同步源码
echo       %SRC%
echo    -> %DST%

if not exist "%SRC%\package.json" (
  echo   [错误] 找不到源码目录：%SRC%
  exit /b 1
)

REM 只同步参与编译的内容，node_modules 与 android 构建产物保持不动
robocopy "%SRC%\src"            "%DST%src"            /MIR /NFL /NDL /NJH /NJS /NC /NS >nul
robocopy "%SRC%\android\app"    "%DST%android\app"    /E /XF *.apk /XD build .gradle /NFL /NDL /NJH /NJS /NC /NS >nul
robocopy "%SRC%\android\gradle" "%DST%android\gradle" /E /NFL /NDL /NJH /NJS /NC /NS >nul
robocopy "%SRC%\android"        "%DST%android"        *.gradle /LEV:1 /NFL /NDL /NJH /NJS /NC /NS >nul
copy /y "%SRC%\index.js"       "%DST%index.js"       >nul
copy /y "%SRC%\shim.js"        "%DST%shim.js"        >nul
copy /y "%SRC%\babel.config.js" "%DST%babel.config.js" >nul
copy /y "%SRC%\metro.config.js" "%DST%metro.config.js" >nul
copy /y "%SRC%\app.json"       "%DST%app.json"       >nul
copy /y "%SRC%\package.json"   "%DST%package.json"   >nul

REM local.properties 必须用正斜杠：Java Properties 会把反斜杠当转义符吃掉
echo sdk.dir=C:/Users/yfj/AppData/Local/Android/Sdk> "%DST%android\local.properties"

if not exist "%DST%android\keystore.properties" (
  echo   [错误] 缺少签名配置 android\keystore.properties
  exit /b 1
)

echo [2/3] 构建 release APK（第一次或清理后较慢，之后会增量编译）
cd /d "%DST%android"
call gradlew.bat assembleRelease --no-daemon -Dorg.gradle.java.installations.paths="%JAVA_HOME%"
if errorlevel 1 (
  echo.
  echo   [失败] 构建未通过，请查看上面的 Gradle 输出
  exit /b 1
)

echo [3/3] 构建完成，产物目录：
echo   %DST%android\app\build\outputs\apk\release
echo.
for %%F in ("%DST%android\app\build\outputs\apk\release\*.apk") do echo   %%~nF%%~xF   %%~zF 字节

echo.
echo 安装提示：包名与官方版相同，需先卸载官方 LX Music 再安装。
endlocal
