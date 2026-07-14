import express from 'express';
import { startServer } from './startServer.js';

describe('startServer', () => {
  it('falls back to the next port when the requested port is busy', async () => {
    const blockerServer = express().listen(0, '127.0.0.1');

    await new Promise((resolve) => blockerServer.once('listening', resolve));

    const app = express();
    const { server, port } = await startServer(app, blockerServer.address().port, '127.0.0.1', 2);

    expect(port).toBe(blockerServer.address().port + 1);

    await new Promise((resolve) => server.close(resolve));
    await new Promise((resolve) => blockerServer.close(resolve));
  });
});
