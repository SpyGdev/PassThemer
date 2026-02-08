const { kv } = require('@vercel/kv');

module.exports = async (request, response) => {
    try {
        if (request.method === 'GET') {
            const count = await kv.get('downloads');
            return response.status(200).json({ count: count || 0 });
        }

        if (request.method === 'POST') {
            const count = await kv.incr('downloads');
            return response.status(200).json({ count });
        }

        return response.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error(error);
        return response.status(500).json({ error: 'Internal Server Error' });
    }
};
