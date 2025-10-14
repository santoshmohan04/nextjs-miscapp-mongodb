"use client";

import {
  MessageType,
  bulkhistory,
  INotificationRecipientHistory,
} from "./templatesdata";
import Table from "react-bootstrap/Table";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import React, { useState } from "react";
import DOMPurify from "dompurify";

export default function BulkTemplatesData() {
  const [show, setShow] = useState(false);
  const [displaytemplate, setDisplayTemplate] =
    useState<INotificationRecipientHistory>({
      recipientId: "",
      recipientAddress: "",
      recipientParameters: "",
      messageType: "",
      subject: "",
      message: "",
      status: "",
      updatedDate: 0,
      acctnbr: "",
      bounced: false,
    });
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const formatBody = (message: string, parameters: string): string => {
    if (!message?.trim() || !parameters?.trim()) {
      return "";
    }

    let newMessage = message;
    const params = parameters.split(",");

    // Remove MSO conditional block
    const msoStart = newMessage.indexOf("<!--[if mso]>");
    const msoEnd = newMessage.indexOf("<![endif]-->");
    if (msoStart !== -1 && msoEnd !== -1) {
      newMessage =
        newMessage.slice(0, msoStart) +
        newMessage.slice(msoEnd + "<![endif]-->".length);
    }

    // Remove closing body and html tags if present
    if (messageContainsBodyAndHtmlTags(newMessage)) {
      const tableIndex = newMessage.indexOf("table");
      if (tableIndex !== -1) {
        newMessage = newMessage.substring(tableIndex - 1);
      }
      newMessage = newMessage.replace(/<\/body>/g, "").replace(/<\/html>/g, "");
    }

    // Mask account number (index 1) once if needed
    if (params[1] && /^\d+$/.test(params[1])) {
      params[1] = params[1].slice(-4);
    }

    // Replace %% placeholders
    let placeholderIndex = 0;
    while (newMessage.includes("%%") && placeholderIndex < params.length) {
      newMessage = newMessage.replace("%%", params[placeholderIndex++]);
    }

    // Replace {0}, {1}, etc.
    for (let i = 0; i < params.length; i++) {
      const placeholder = `{${i}}`;
      if (newMessage.includes(placeholder)) {
        newMessage = newMessage.split(placeholder).join(params[i]);
      }
    }

    return newMessage;
  };

  const messageContainsBodyAndHtmlTags = (message: string): boolean => {
    return message.includes("</body>") && message.includes("</html>");
  };

  const formatPhoneNumber = (phone: string): string => {
    return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6)}`;
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const viewTemplate = (template: INotificationRecipientHistory) => {
    const formattedData = formatBody(
      template.message,
      template.recipientParameters
    );
    setDisplayTemplate({ ...template, message: formattedData });
    setShow(true);
  };

  const printTemplate = (template: INotificationRecipientHistory) => {
    const formattedData = formatBody(
      template.message,
      template.recipientParameters
    );
    setDisplayTemplate({ ...template, message: formattedData });
    const printWindow = window.open("", "_blank", "width=900,height=600");
    if (printWindow) {
      printWindow.document.write(`
                    <html>
                    <head>
                      <title>Alerts</title>
                    </head>
                    <body>
                  <div style="margin-bottom: 18px;">
                    <span style="font-weight: bold;">Subject:</span>
                    <span> ${displaytemplate.subject}</span>
                  </div>
                      ${displaytemplate.message}
                    </body>
                    </html>
                  `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  const getSanitisedData = (text: string) => {
    return DOMPurify.sanitize(text);
  };

  return (
    <div className="container mt-3">
      <h3>Bulk Alerts History</h3>
      <Table striped bordered hover variant="light" className="mt-3">
        <thead>
          <tr>
            <th>Sent Date</th>
            <th>Status</th>
            <th>Description/Subject</th>
            <th>Delivery Method</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {bulkhistory.bulkNotificationHistories.map(
            (t: INotificationRecipientHistory, index: number) => (
              <tr key={index}>
                <td>{formatDate(t.updatedDate)}</td>
                <td>
                  {t.status === "S" ? "Sent" : t.status === "N" ? "New" : ""}
                </td>
                <td>{t.subject}</td>
                <td>
                  {t?.messageType === MessageType.T
                    ? formatPhoneNumber(t?.recipientAddress ?? "")
                    : t?.messageType === MessageType.H
                    ? t?.recipientAddress ?? ""
                    : t?.messageType === MessageType.P
                    ? "Mobile Push Notification"
                    : t?.messageType === MessageType.C
                    ? formatPhoneNumber(t?.recipientAddress ?? "")
                    : t?.messageType}
                </td>
                <td>
                  <a className="action-link" onClick={() => viewTemplate(t)}>
                    View
                  </a>
                  <span>&nbsp;</span>
                  <a className="action-link" onClick={() => printTemplate(t)}>
                    Print
                  </a>
                </td>
              </tr>
            )
          )}
        </tbody>
      </Table>
      <Modal
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        scrollable
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">Alert</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <span className="f6 fw4">Subject: </span>
            <span className="f4 fw4">{displaytemplate.subject}</span>
          </div>
          <div
            dangerouslySetInnerHTML={{
              __html: getSanitisedData(displaytemplate?.message),
            }}
          ></div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
