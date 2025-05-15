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