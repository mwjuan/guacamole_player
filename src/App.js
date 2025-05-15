import React, { useEffect, useState } from 'react';
import GuacamoleClient from './GuacamoleClient';
import axios from 'axios';
import qs from 'qs';
import { Spin } from 'antd';


const App = () => {
  const [guacdhost, setGuacdHost] = useState('127.0.0.1')
  const [connectionParams, setConnectionParams] = useState(null);
  const [token, setToken] = useState('') // guacamole token
  const [state, setState] = useState(0) // 远程桌面连接状态
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (token) return;

    // 获取guacamole token
    async function getToken() {
      let data = qs.stringify({
        'username': 'guacadmin',  // guacamole服务登录账号
        'password': 'guacadmin'
      });

      let config = {
        method: 'post',
        url: 'http://127.0.0.1:3000/server/guacamole/api/tokens',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data
      };

      let result = await axios.request(config);
      if (result.status === 200) {
        setToken(result.data.authToken)
      }
    }

    getToken();
  }, [token])

  const connectRDP = () => {
    setLoading(true)
    setConnectionParams({
      // guacamole代理服务信息
      'guacd-hostname': guacdhost,
      'guacd-port': '4822',
      // guacamole token
      'token': token,

      'GUAC_ID': 1,
      'GUAC_TYPE': 'c',
      'GUAC_DATA_SOURCE': 'mysql',

      // 远程桌面连接参数
      'hostname': '172.16.25.49', // ip
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
    });
  };

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
      {!token && <h1>获取token失败</h1>}
      {loading && state !== 3 && <Spin tip="Loading" size='large' style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }} />}
      {!loading && state !== 3 && <button style={{ fontSize: 20 }} onClick={connectRDP}>连接RDP</button>}
      {connectionParams && (
        <GuacamoleClient connectionParams={connectionParams} onState={(state) => setState(state)} guacdhost={guacdhost} />
      )}
      {/* eslint-disable-next-line no-mixed-operators */}
      {state === 4 || state === 5 && <h1>连接失败</h1>}
    </div>
  );
};

export default App;