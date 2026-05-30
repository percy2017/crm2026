module.exports = {
  apps: [
    {
      name: 'reverb',
      script: 'artisan',
      args: 'reverb:start --debug',
      interpreter: 'php',
      watch: false,
      instances: 1,
      autorestart: true,
      max_memory_restart: '512M',
    },
  ],
}
