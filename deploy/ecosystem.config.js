// PM2 конфигурация для production
module.exports = {
  apps: [
    {
      name: 'aso-backend',
      script: 'dist/main.js',
      cwd: '/var/www/aso_store/backend',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
      error_file: '/var/log/aso_store/backend-error.log',
      out_file: '/var/log/aso_store/backend-out.log',
      log_file: '/var/log/aso_store/backend-combined.log',
      time: true,
      max_memory_restart: '1G',
      node_args: '--max-old-space-size=1024',
    },
    {
      name: 'aso-frontend',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/aso_store/frontend',
      instances: 1,
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: '/var/log/aso_store/frontend-error.log',
      out_file: '/var/log/aso_store/frontend-out.log',
      log_file: '/var/log/aso_store/frontend-combined.log',
      time: true,
      max_memory_restart: '1G',
    },
  ],
};