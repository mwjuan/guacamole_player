概念
Apache Guacamole是Apache开源的无客户端的连接远程机器的网关，旨在通过标准的网络协议（如VNC、RDP、SSH）提供远程系统的无缝访问。
架构
Guacamole的架构主要分为三个部分：Guacamole Server、Guacamole proxy（guacd）、Guacamole Client。整体架构图如下所示：

[图片]
1. Guacamole Client
由JavaScript实现，一旦被加载到用户的web浏览器中，会立即连接到 Guacamole Server，这两者之间的交互是通过Guacamole协议完成的。
2. Guacamole Server
由Java实现，作为web应用部署，读取 Guacamole 协议的数据并将其转发到guacd，Guacamole协议是一个远程屏幕绘制和事件传输协议，本身不实现任何特定桌面系统的远程桌面功能。
3. Guacamole proxy（guacd）
由C实现的原生应用，将 Guacamole 协议的数据翻译成RDP、VNC、SSH等协议的数据，并以客户端的身份连接到多个远程桌面服务端。
Docker 部署 Guacamole 
1. 搭建 mysql 服务并初始化数据库
// 在docker容器中安装mysql
docker run -d -p 3306:3306 --name mysql -e MYSQL_ROOT_PASSWORD=guacamole mysql
官方提供了数据库文件，导入即可
// 生成数据库文件
docker run --rm Guacamole/Guacamole /opt/Guacamole/bin/initdb.sh --mysql > initdb.sql

// 复制到mysql容器内
docker cp initdb.sql mysql:/

// 进入mysql容器初始化数据库
➜  ~ git:(main) ✗ docker exec -it mysql bash
bash-4.4# mysql -uroot -pguacamole
mysql: [Warning] Using a password on the command line interface can be insecure.
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 36
Server version: 8.3.0 MySQL Community Server - GPL

Copyright (c) 2000, 2024, Oracle and/or its affiliates.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.
// 创建数据库
mysql> create database guac_db;
Query OK, 1 row affected (0.01 sec)

mysql> use guac_db;
Database changed
// 初始化数据库
mysql> source /initdb.sql
Query OK, 0 rows affected (0.00 sec)
...
mysql> 
2. 搭建 guacd 服务器
docker pull Guacamole/guacd
docker run --name guacd -d -p 4822:4822 Guacamole/guacd
3. 搭建 Guacamole 服务器
docker pull Guacamole/Guacamole
docker run --name Guacamole --link guacd:guacd --link mysql:mysql -e MYSQL_DATABASE=guac -e MYSQL_USER=root -e MYSQL_PASSWORD=guacamole -d -p 8080:8080 Guacamole/Guacamole
此时，浏览器访问 http://localhost:8080/Guacamole 即可看到Guacamole应用，右上角菜单可设置连接并远程，到此已经是一个可用的完整应用。
[图片]
[图片]
[图片]
React 项目中使用 Guacamole
1. 安装 Guacamole-common-js
yarn add Guacamole-common-js
2.  获取 Guacamole token
let data = qs.stringify({
    'username': 'guacadmin',  // Guacamole服务登录账号
    'password': 'guacadmin'
});

let config = {
    method: 'post',
    url: 'http://127.0.0.1:3000/server/Guacamole/api/tokens',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    },
    data
};
3.  创建 Guacamole client
import { useEffect, useRef } from 'react';
import Guacamole from 'Guacamole-common-js';
import { keycodeKeysyms } from './helper.js';

const GuacamoleClient = ({ connectionParams, onState, guacdhost }) => {
  const displayRef = useRef(null);
  const clientRef = useRef(null);

  useEffect(() => {
    if (!connectionParams) return;

    // 构建WebSocket URL
    const wsUrl = buildWebSocketUrl(connectionParams, guacdhost);

    // 创建隧道
    const tunnel = new Guacamole.WebSocketTunnel(wsUrl);

    // 创建客户端
    const client = new Guacamole.Client(tunnel);
    clientRef.current = client;

    // 获取显示元素
    const display = displayRef.current;
    display.innerHTML = ''; // 清空现有内容

    // 添加显示元素
    const displayElement = client.getDisplay().getElement();
    display.appendChild(displayElement);

    // 错误处理
    client.onerror = (error) => {
      console.error('Guacamole client error:', error);
    };

    // 连接关闭处理
    client.onstatechange = (state) => {
      onState(state)
      if (state === Guacamole.Client.State.CLOSED) {
        display.innerHTML = '<div>连接已关闭</div>';
      }
    };

    // 连接客户端
    client.connect();

    // 键盘事件处理
    const handleKeyEvent = (e) => {
      if (!clientRef.current) return;
      const keydown = e.type === 'keydown' ? 1 : 0;
      const keyCode = keycodeKeysyms[e.keyCode]; // 
      clientRef.current.sendKeyEvent(keydown, keyCode);
      e.preventDefault();
    };

    // 鼠标事件处理
    const handleMouseEvent = (e) => {
      if (!clientRef.current || !displayRef.current) return;
      const rect = displayRef.current.getBoundingClientRect();
      const x = Math.floor(e.clientX - rect.left);
      const y = Math.floor(e.clientY - rect.top);

      let left = false;
      let right = false;
      let middle = false;
      if (e.buttons === 1) { left = true; right = false; middle = false; }  // 左键
      if (e.buttons === 2) { left = false; right = true; middle = false; } // 右键
      if (e.buttons === 4) { left = false; right = false; middle = true; } // 中键

      clientRef.current.sendMouseState({ x, y, left, right, middle });
      e.preventDefault();
    };

    // 添加事件监听
    window.addEventListener('keydown', handleKeyEvent);
    window.addEventListener('keyup', handleKeyEvent);
    display.addEventListener('mousedown', handleMouseEvent);
    display.addEventListener('mouseup', handleMouseEvent);
    display.addEventListener('mousemove', handleMouseEvent);
    display.addEventListener('wheel', (e) => {
      if (!clientRef.current) return;
      const rect = displayRef.current.getBoundingClientRect();
      const x = Math.floor(e.clientX - rect.left);
      const y = Math.floor(e.clientY - rect.top);
      clientRef.current.sendMouseState(x, y, e.buttons, e.deltaY);
      e.preventDefault();
    });

    // 清理函数
    return () => {
      if (clientRef.current) {
        clientRef.current.disconnect();
      }
      window.removeEventListener('keydown', handleKeyEvent);
      window.removeEventListener('keyup', handleKeyEvent);
      display.removeEventListener('mousedown', handleMouseEvent);
      display.removeEventListener('mouseup', handleMouseEvent);
      display.removeEventListener('mousemove', handleMouseEvent);
    };
  }, [connectionParams]);

  return <div ref={displayRef} style={{ width: '100%', height: '100%' }} />;
};

// 构建WebSocket URL
function buildWebSocketUrl(params, guacdhost) {
  const baseUrl = `ws://127.0.0.1:8080/Guacamole/websocket-tunnel`;
  const queryParams = new URLSearchParams();

  // 添加所有连接参数
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value);
    }
  }

  return `${baseUrl}?${queryParams.toString()}`;
}

export default GuacamoleClient;
4. 使用及配置
const connectionParams = {
      'guacd-hostname': '127.0.0.1', // Guacamole代理服务ip
      'guacd-port': '4822', // Guacamole代理端口
      'token': token,  // Guacamole 认证token

      'GUAC_ID': 1,  // 固定值
      'GUAC_TYPE': 'c',  // 固定值
      'GUAC_DATA_SOURCE': 'mysql', // 连接数据库服务名称

      'hostname': '172.16.25.49', // 远程桌面ip
      'port': '3389', // 默认3389
      'username': 'Administrator',  // 用户名
      'password': '33', // 密码
      'security': 'rdp', // 协议
      'ignore-cert': 'true', // 是否忽略服务器证书

      // 显示参数
      'GUAC_WIDTH': 1920,
      'GUAC_HEIGHT': 1080,
      'GUAC_DPI': 86,
      'GUAC_TIMEZONE': 'Asia/Shanghai',
      'GUAC_AUDIO': 'audio/L8',
      'GUAC_AUDIO': 'audio/L16',
      'GUAC_IMAGE': 'image/jpeg',
      'GUAC_IMAGE': 'image/png',
      'GUAC_IMAGE': 'image/webp'
};

....
<GuacamoleClient connectionParams={connectionParams} />
....
[图片]
参考文档
1. Apache Guacamole®
2. JavaScript API
3. Guacamole_apache Guacamole-CSDN博客
4. Docker部署Guacamole手册
