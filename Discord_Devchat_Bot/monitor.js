const { results } = require('@permaweb/aoconnect');
const WebSocket = require('ws');

let cursor = '';
const ws = new WebSocket('ws://localhost:8080');

ws.on('open', () => {
  console.log('WebSocket Connection Success');
});

ws.on('error', (error) => {
  console.error('WebSocket Error:', error);
});


async function MonitorMsg() {
  try {
    if (cursor == '') {
      const resultsOut = await results({
        process: 'RlWKA9pJdJjdM-_KMTo-4NHjqyAZxqm-tZDx1tOAFBY',
        sort: 'DESC',
        limit: 1,
      });
      cursor = resultsOut.edges[0].cursor;
      console.log('Results:', resultsOut);
    }

    console.log('MonitorMsg...');
    const resultsOut2 = await results({
      process: 'RlWKA9pJdJjdM-_KMTo-4NHjqyAZxqm-tZDx1tOAFBY',
      from: cursor,
      sort: 'ASC',
      limit: 50,
    });

    for (const element of resultsOut2.edges.reverse()) {
      cursor = element.cursor;
      console.log('Element Data:', element.node.Messages);

      for (const msg of element.node.Messages) {
        console.log('Message Tags:', msg.Tags);
      }

      const messagesData = element.node.Messages.filter(e => e.Tags.length > 0 && e.Tags.some(f => f.name == 'Action' && f.value == 'Say'));
      console.log('Filtred Message Data:', messagesData);
      for (const messagesItem of messagesData) {
          const event = messagesItem.Tags.find(e => e.name == 'Event')?.value || 'New message from ThekayzRoom';
          const sendTest = event + ' : ' + messagesItem.Data;
          console.log('Received Message:', sendTest);
          ws.send(sendTest);
      }
    }

  } catch (error) {
    console.error('MonitorMsg Error:', error);
    console.error('Error Details:', error.message);
  } finally {
    setTimeout(MonitorMsg, 5000);
  }
}

MonitorMsg();
