module.exports = {
  apps : [{
    name: "zhongcheng_rental",
    script: "./server.js",
    exec_mode: "cluster", // 设置执行模式，值为：fork|cluster

    exec_interpreter: "node",
    // 定时重启,仅在 cluster 模式有效, [minute] [hour] [day] [month] [day of week]

    instances: 1, // 负数代表服务器 cup 核心数

    autorestart: true, // 进程失败后启用或禁用自重启

    watch: false, // 文件有改变则重启,用于调试

    max_memory_restart: "300M", // 如果超出内存量，重新启动应用
    env: {
      NODE_ENV: "production",
    }
  }]
}
