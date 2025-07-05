import asyncio
import json
import uuid
import websockets

waiting = []
connections = {}
partners = {}

async def handler(ws, path):
    ws_id = uuid.uuid4().hex
    connections[ws_id] = ws
    try:
        async for message in ws:
            data = json.loads(message)
            msg_type = data.get('type')
            if msg_type == 'join':
                ws.mobile = bool(data.get('mobile'))
                if waiting:
                    other_id = waiting.pop(0)
                    other = connections.get(other_id)
                    if other:
                        partners[ws_id] = other_id
                        partners[other_id] = ws_id
                        await ws.send(json.dumps({
                            'type': 'match',
                            'id': other_id,
                            'initiator': False,
                            'partnerMobile': getattr(other, 'mobile', False)
                        }))
                        await other.send(json.dumps({
                            'type': 'match',
                            'id': ws_id,
                            'initiator': True,
                            'partnerMobile': ws.mobile
                        }))
                    else:
                        waiting.append(ws_id)
                else:
                    waiting.append(ws_id)
            elif msg_type == 'signal':
                to_id = data.get('to')
                if to_id in connections:
                    await connections[to_id].send(json.dumps({
                        'type': 'signal',
                        'from': ws_id,
                        'data': data.get('data')
                    }))
            elif msg_type == 'leave':
                partner_id = partners.get(ws_id)
                if partner_id and partner_id in connections:
                    await connections[partner_id].send(json.dumps({'type': 'partner-left'}))
                    partners.pop(partner_id, None)
                    partners.pop(ws_id, None)
                else:
                    if ws_id in waiting:
                        waiting.remove(ws_id)
    finally:
        partner_id = partners.get(ws_id)
        if partner_id and partner_id in connections:
            await connections[partner_id].send(json.dumps({'type': 'partner-left'}))
            partners.pop(partner_id, None)
            partners.pop(ws_id, None)
        else:
            if ws_id in waiting:
                waiting.remove(ws_id)
        connections.pop(ws_id, None)


async def main():
    async with websockets.serve(handler, '0.0.0.0', 8000, ping_interval=None):
        print('Server running on ws://0.0.0.0:8000/ws')
        await asyncio.Future()  # run forever


if __name__ == '__main__':
    asyncio.run(main())
