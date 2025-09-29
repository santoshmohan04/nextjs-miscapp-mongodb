'use client';

import { useEffect, useState } from 'react';
import { bulkhistory } from './templatesdata';
import ListGroup from 'react-bootstrap/ListGroup';

export default function BulkTemplatesData() {
  const [templates, setTemplates] = useState<string[]>([]);

  useEffect(() => {
    const formattedTemplates = bulkhistory.bulkNotificationHistories.map((t) =>
      formatBody(t.messageType, t.recipientParameters)
    );
    setTemplates(formattedTemplates);
  }, []);

  const formatBody = (message: string, parameters: string): string => {
    let newMessage = '';

    if (message?.trim() && parameters?.trim()) {
      newMessage = message;
      const params = parameters.split(',');

      // Remove MSO conditional block
      if (newMessage.includes('[if mso]')) {
        const start = newMessage.indexOf('<!--[if mso]>');
        const end = newMessage.indexOf('<![endif]-->') + '<![endif]-->'.length;
        newMessage = newMessage.slice(0, start) + newMessage.slice(end);
      }

      // Remove closing body and html tags if present
      if (messageContainsBodyAndHtmlTags(newMessage)) {
        const tableIndex = newMessage.indexOf('table');
        if (tableIndex !== -1) {
          newMessage = newMessage.substring(tableIndex - 1);
        }
        newMessage = newMessage
          .replace(/<\/body>/g, '')
          .replace(/<\/html>/g, '');
      }

      // Replace %% placeholders
      if (newMessage.includes('%%')) {
        for (let i = 0; i < params.length; i++) {
          maskAcctNbr(params, i);
          newMessage = newMessage.replace('%%', params[i]);
        }
      }

      // Replace {0}, {1}, etc.
      for (let i = 0; i < params.length; i++) {
        const placeholder = `{${i}}`;
        if (newMessage.includes(placeholder)) {
          maskAcctNbr(params, i);
          newMessage = newMessage.replace(
            new RegExp(placeholder, 'g'),
            params[i]
          );
        }
      }
    }

    return newMessage;
  };

  const messageContainsBodyAndHtmlTags = (message: string): boolean => {
    return message.includes('</body>') && message.includes('</html>');
  };

  const maskAcctNbr = (params: string[], index: number): void => {
    if (index === 1 && /^\d+$/.test(params[index])) {
      params[index] = params[index].slice(-4);
    }
  };

  return (
    <div className="container mt-3">
      <h1>Bulk Templates</h1>
      <ListGroup>
        {templates.map((t: any, index) => (
          <ListGroup.Item key={index}>{t}</ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
}
