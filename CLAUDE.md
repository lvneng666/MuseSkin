# MuseSkin (Peaffee)

护肤电商,前端 Vue 3 + 后端 Spring Boot 3。生产环境部署在腾讯云 `81.70.182.149`,域名 `yuki.sindir.cn`。

## SSH

本机已为生产服务器配置好 SSH 别名,直接用即可:

```
ssh museskin
```

对应 `~/.ssh/config`:
- Host `museskin`
- HostName `81.70.182.149`,User `ubuntu`,IdentityFile `~/.ssh/museskin_deploy`(免密)

常用部署命令见记忆 `museskin-deployment.md`(systemd 服务 `museskin-backend`,静态前端 `/opt/museskin/site`,PostgreSQL 容器 `museskin_postgres`)。
