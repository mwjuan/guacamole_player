### 概念
Apache Guacamole是Apache开源的无客户端的连接远程机器的网关，旨在通过标准的网络协议（如VNC、RDP、SSH）提供远程系统的无缝访问。
### 架构
Guacamole的架构主要分为三个部分：Guacamole Server、Guacamole proxy（guacd）、Guacamole Client。整体架构图如下所示：

![image](https://github.com/user-attachments/assets/2b99c5a0-e482-4ff5-b844-d4211bfcc748)

1. Guacamole Client
由JavaScript实现，一旦被加载到用户的web浏览器中，会立即连接到 Guacamole Server，这两者之间的交互是通过Guacamole协议完成的。
2. Guacamole Server
由Java实现，作为web应用部署，读取 Guacamole 协议的数据并将其转发到guacd，Guacamole协议是一个远程屏幕绘制和事件传输协议，本身不实现任何特定桌面系统的远程桌面功能。
3. Guacamole proxy（guacd）
由C实现的原生应用，将 Guacamole 协议的数据翻译成RDP、VNC、SSH等协议的数据，并以客户端的身份连接到多个远程桌面服务端。
### Docker 部署 Guacamole 
1. 搭建 mysql 服务并初始化数据库
```sh // 在docker容器中安装mysql
docker run -d -p 3306:3306 --name mysql -e MYSQL_ROOT_PASSWORD=guacamole mysql
```
官方提供了数据库文件，导入即可
```sh// 生成数据库文件
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
```
2. 搭建 guacd 服务器
```sh
docker pull Guacamole/guacd
docker run --name guacd -d -p 4822:4822 Guacamole/guacd
```
4. 搭建 Guacamole 服务器
```sh
docker pull Guacamole/Guacamole
docker run --name Guacamole --link guacd:guacd --link mysql:mysql -e MYSQL_DATABASE=guac -e MYSQL_USER=root -e MYSQL_PASSWORD=guacamole -d -p 8080:8080 Guacamole/Guacamole
```
此时，浏览器访问 http://localhost:8080/Guacamole 即可看到Guacamole应用，右上角菜单可设置连接并远程，到此已经是一个可用的完整应用。
![image](https://github.com/user-attachments/assets/3c356722-afcd-4d6f-9934-8995f47806a8)
![image](https://github.com/user-attachments/assets/6ab25e6f-c797-4b17-a420-eafcddc914ba)
![image](https://github.com/user-attachments/assets/dd2585a8-6cd2-4ed2-8011-993eb5cb4a99)

### React 项目中使用 Guacamole
1. 安装 Guacamole-common-js
```sh
yarn add Guacamole-common-js
```
2.  获取 Guacamole token
```sh
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
```
3.  创建 Guacamole client
```sh
import { useEffect, useRef } from 'react';
import Guacamole from 'guacamole-common-js';

var keycodeKeysyms = {
  8: 0xFF08, // backspace
  9: 0xFF09, // tab
  12: 0xFF0B, // clear       / KP 5
  13: 0xFF0D, // enter
  16: 0xFFE1, // shift
  17: 0xFFE3, // ctrl
  18: 0xFFE9, // alt
  19: 0xFF13, // pause/break
  20: 0xFFE5, // caps lock
  27: 0xFF1B, // escape
  32: 0x0020, // space
  33: 0xFF55, // page up     / KP 9
  34: 0xFF56, // page down   / KP 3
  35: 0xFF57, // end         / KP 1
  36: 0xFF50, // home        / KP 7
  37: 0xFF51, // left arrow  / KP 4
  38: 0xFF52, // up arrow    / KP 8
  39: 0xFF53, // right arrow / KP 6
  40: 0xFF54, // down arrow  / KP 2
  45: 0xFF63, // insert      / KP 0
  46: 0xFFFF, // delete      / KP decimal
  91: 0xFFE7, // left windows/command key (meta_l)
  92: 0xFFE8, // right window/command key (meta_r)
  93: 0xFF67, // menu key
  96: 0xFFB0, // KP 0
  97: 0xFFB1, // KP 1
  98: 0xFFB2, // KP 2
  99: 0xFFB3, // KP 3
  100: 0xFFB4, // KP 4
  101: 0xFFB5, // KP 5
  102: 0xFFB6, // KP 6
  103: 0xFFB7, // KP 7
  104: 0xFFB8, // KP 8
  105: 0xFFB9, // KP 9
  106: 0xFFAA, // KP multiply
  107: 0xFFAB, // KP add
  109: 0xFFAD, // KP subtract
  110: 0xFFAE, // KP decimal
  111: 0xFFAF, // KP divide
  112: 0xFFBE, // f1
  113: 0xFFBF, // f2
  114: 0xFFC0, // f3
  115: 0xFFC1, // f4
  116: 0xFFC2, // f5
  117: 0xFFC3, // f6
  118: 0xFFC4, // f7
  119: 0xFFC5, // f8
  120: 0xFFC6, // f9
  121: 0xFFC7, // f10
  122: 0xFFC8, // f11
  123: 0xFFC9, // f12
  144: 0xFF7F, // num lock
  145: 0xFF14, // scroll lock
  225: 0xFE03,  // altgraph (iso_level3_shift)
  "Again": 0xFF66,
  "AllCandidates": 0xFF3D,
  "Alphanumeric": 0xFF30,
  "Alt": 0xFFE9,
  "Attn": 0xFD0E,
  "AltGraph": 0xFE03,
  "ArrowDown": 0xFF54,
  "ArrowLeft": 0xFF51,
  "ArrowRight": 0xFF53,
  "ArrowUp": 0xFF52,
  "Backspace": 0xFF08,
  "CapsLock": 0xFFE5,
  "Cancel": 0xFF69,
  "Clear": 0xFF0B,
  "Convert": 0xFF21,
  "Copy": 0xFD15,
  "Crsel": 0xFD1C,
  "CrSel": 0xFD1C,
  "CodeInput": 0xFF37,
  "Compose": 0xFF20,
  "Control": 0xFFE3,
  "ContextMenu": 0xFF67,
  "Delete": 0xFFFF,
  "Down": 0xFF54,
  "End": 0xFF57,
  "Enter": 0xFF0D,
  "EraseEof": 0xFD06,
  "Escape": 0xFF1B,
  "Execute": 0xFF62,
  "Exsel": 0xFD1D,
  "ExSel": 0xFD1D,
  "F1": 0xFFBE,
  "F2": 0xFFBF,
  "F3": 0xFFC0,
  "F4": 0xFFC1,
  "F5": 0xFFC2,
  "F6": 0xFFC3,
  "F7": 0xFFC4,
  "F8": 0xFFC5,
  "F9": 0xFFC6,
  "F10": 0xFFC7,
  "F11": 0xFFC8,
  "F12": 0xFFC9,
  "F13": 0xFFCA,
  "F14": 0xFFCB,
  "F15": 0xFFCC,
  "F16": 0xFFCD,
  "F17": 0xFFCE,
  "F18": 0xFFCF,
  "F19": 0xFFD0,
  "F20": 0xFFD1,
  "F21": 0xFFD2,
  "F22": 0xFFD3,
  "F23": 0xFFD4,
  "F24": 0xFFD5,
  "Find": 0xFF68,
  "GroupFirst": 0xFE0C,
  "GroupLast": 0xFE0E,
  "GroupNext": 0xFE08,
  "GroupPrevious": 0xFE0A,
  "FullWidth": null,
  "HalfWidth": null,
  "HangulMode": 0xFF31,
  "Hankaku": 0xFF29,
  "HanjaMode": 0xFF34,
  "Help": 0xFF6A,
  "Hiragana": 0xFF25,
  "HiraganaKatakana": 0xFF27,
  "Home": 0xFF50,
  "Hyper": 0xFFED,
  "Insert": 0xFF63,
  "JapaneseHiragana": 0xFF25,
  "JapaneseKatakana": 0xFF26,
  "JapaneseRomaji": 0xFF24,
  "JunjaMode": 0xFF38,
  "KanaMode": 0xFF2D,
  "KanjiMode": 0xFF21,
  "Katakana": 0xFF26,
  "Left": 0xFF51,
  "Meta": 0xFFE7,
  "ModeChange": 0xFF7E,
  "NumLock": 0xFF7F,
  "PageDown": 0xFF56,
  "PageUp": 0xFF55,
  "Pause": 0xFF13,
  "Play": 0xFD16,
  "PreviousCandidate": 0xFF3E,
  "PrintScreen": 0xFF61,
  "Redo": 0xFF66,
  "Right": 0xFF53,
  "RomanCharacters": null,
  "Scroll": 0xFF14,
  "Select": 0xFF60,
  "Separator": 0xFFAC,
  "Shift": 0xFFE1,
  "SingleCandidate": 0xFF3C,
  "Super": 0xFFEB,
  "Tab": 0xFF09,
  "UIKeyInputDownArrow": 0xFF54,
  "UIKeyInputEscape": 0xFF1B,
  "UIKeyInputLeftArrow": 0xFF51,
  "UIKeyInputRightArrow": 0xFF53,
  "UIKeyInputUpArrow": 0xFF52,
  "Up": 0xFF52,
  "Undo": 0xFF65,
  "Win": 0xFFE7,
  "Zenkaku": 0xFF28,
  "ZenkakuHankaku": 0xFF2A
};

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
      const keyCode = keycodeKeysyms[e.keyCode];
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
  const baseUrl = `ws://${guacdhost}:8080/guacamole/websocket-tunnel`;
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
```
4. 使用及配置
```sh
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
```
![image](https://github.com/user-attachments/assets/0323af19-0709-459f-9b71-3ab9d6424fcc)

### 参考文档
1. [Apache Guacamole®](https://guacamole.apache.org/)
2. [JavaScript API](https://guacamole.apache.org/doc/guacamole-common-js/)
3. [Guacamole_apache Guacamole-CSDN博客](https://blog.csdn.net/weixin_43114209/article/details/131787636)
4. [Docker部署Guacamole手册](https://blog.csdn.net/weixin_48227918/article/details/132632049)
