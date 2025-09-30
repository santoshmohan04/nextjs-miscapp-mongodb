export const bulkhistory = {
  "responses": [],
  "bulkNotificationHistories": [
      {
          "recipientId": "45325",
          "recipientAddress": "Yannick.Cassar@example.com",
          "recipientParameters": "Hermina,2047922,2909,1106.00",
          "messageType": "H",
          "subject": "Activity on Your Checking Account",
          "message": "<html> <head> <title>Alerts</title> <meta http-equiv=\"Content-Type\"content=\"text/html;charset=iso-8859-1\"> <style> p { font-size: 18px; color: #333333;line-height: 24px; } </style> </head> <body bgcolor=\"#FFFFFF\"> <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\"> <tr> <td  valign=\"top\"  bgcolor=\"#FFFFFF\"> <div> <table cellpadding=\"0\"  style=\"width:100%;\" cellspacing=\"0\"> <tr align=\"left\" valign=\"middle\" bgcolor=\"#1C5495\" >  <td> <table cellspacing=\"0\" style=\"width:100%;\"> <tr> <td><div><img src=\"https://www.rbfcu.org/images/default-source/nbo/email-templates/rbfcu-blue-logo-alerts.png\" alt=\"RBFCU eAlerts\" align=\"left\"></div></td> </tr> </table> </td> </tr> <tr align=\"left\" valign=\"middle\"> <td  valign=\"top\"><br> <font color=\"#333333\" style= face=\"Arial, Helvetica, sans-serif\"><strong>Activity Alert</strong></font> <p><font color=\"#333333\" style=\"font-size:11pt;\"face=\"Arial, Helvetica, sans-serif\"></font><font color=\"#333333\" style=\"font-size:11pt;\"face=\"Arial, Helvetica, sans-serif\">Dear %%,</font></p> <p style=\"margin:0\"><font color=\"#333333\" style=\"font-size:11pt;\" face=\"Arial, Helvetica, sans-serif\">A check has cleared from your Checking Account. Please see below:</font></p><br> </td> </tr> <tr align=\"left\" valign=\"middle\"> <td> <table cellspacing=\"0\" cellpadding=\"25\" bordercolor=\"#979797\" bgcolor=\"#F7F7F7\" style=\"width:100%;\"> <tr> <td> <font color=\"#333333\" style=\"font-size:11pt;\" face=\"Arial, Helvetica, sans-serif\"> <table> <tr>  <td> <font color=\"#333333\" style=\"font-size:11pt;\" face=\"Arial, Helvetica, sans-serif\">Account ending in:</font></td> <td> <font color=\"#333333\" style=\"font-size:11pt;\" face=\"Arial, Helvetica, sans-serif\"><strong>%%</strong></font></td> </tr> <tr> <td> <font color=\"#333333\" style=\"font-size:11pt;\" face=\"Arial, Helvetica, sans-serif\">Check Number:</font></td> <td> <font color=\"#333333\" style=\"font-size:11pt;\" face=\"Arial, Helvetica, sans-serif\"><strong>%%</strong></font></td> </tr> <tr> <td> <font color=\"#333333\" style=\"font-size:11pt;\" face=\"Arial, Helvetica, sans-serif\">Amount:</font></td> <td> <font color=\"#333333\" style=\"font-size:11pt;\" face=\"Arial, Helvetica, sans-serif\"><strong>$%%</strong></font></td> </tr> </table> </font> </td> </tr> </table><br> </td> </tr> <tr><td> <table cellspacing=\"0\" > <tr align=\"left\" valign=\"middle\"> <td> <p><font color=\"#333333\" style=\"font-size:11pt;\" face=\"Arial, Helvetica, sans-serif\">To view details, sign in to your Online Banking account at </font> <font color=\"#097EE7\" style=\"font-size:11pt;\" face=\"Arial, Helvetica, sans-serif\"><a href=\"https://www.rbfcu.org\">rbfcu.org</a></font><font color=\"#333333\" style=\"font-size:11pt;\" face=\"Arial, Helvetica, sans-serif\"> or the RBFCU Mobile app and visit your Account Activity page.</font><br/><br/><font color=\"#333333\" style=\"font-size:11pt;\" face=\"Arial, Helvetica, sans-serif\"> To ensure your Alerts are not disrupted, please keep your email address current.  If you need to update your contact information, please visit the My Profile page in your Online Banking account</font><font color=\"#097EE7\" style=\"font-size:11pt;\" face=\"Arial, Helvetica, sans-serif\"> <a color=\"#333333\" href=\"https://www.rbfcu.org\">rbfcu.org</a></font><font color=\"#333333\" style=\"font-size:11pt;\" face=\"Arial, Helvetica, sans-serif\">, then update it on My Profile.<br/><br/> Thank you,<br/> RBFCU</font> </p> </td> </tr> </table> </td> </tr> <tr><td> <table width=\"100%\"> <tr> <td> <hr style=\"display:block;\"> </td> </tr> </table> <table cellspacing=\"0\"> <tr align=\"left\" valign=\"middle\"> <td> <p style=\"line-height: 18px;\"> <font color=\"#333333\" style=\"font-size:8pt;\" face=\"Arial, Helvetica, sans-serif\"> Please do not reply to this message. <br> For questions about your RBFCU notifications, or other products and services, contact us at <a href=\"tel:1-800-580-3300\">1-800-580-3300</a> or <a href=\"mailto:memberservices@rbfcu.org\">memberservices@rbfcu.org</a>.<br> For your protection, please do not provide any personal information via email. Please sign in to your Online Banking account at <a href=\"https://www.rbfcu.org\">rbfcu.org</a> to chat with a Member Service Representative. <br> If you want to change or cancel your notification preferences, please sign in at <a href=\"https://www.rbfcu.org\">rbfcu.org</a>. View our <a href=\"https://www.rbfcu.org/privacy-policy\">Privacy Policy</a>. <br><br></font></p></td> </tr> <tr><td><div><img src=\"https://www.rbfcu.org/images/default-source/nbo/email-templates/ncua-gray.jpg\" alt=\"RBFCU eAlerts\"></div></td></tr></table> </td></tr> </table> <br> </div> </td> </tr> </table> </body> </html>",
          "status": "S",
          "updatedDate": 1757516844356,
          "acctnbr": "2047922",
          "bounced": false
      },
      {
          "recipientId": "45325",
          "recipientAddress": "5127840267",
          "recipientParameters": "Hermina,2047922,2909,1106.00",
          "messageType": "T",
          "subject": "Alert",
          "message": "Your Checking Account x{1} - check no. {2} has cleared for ${3}.",
          "status": "S",
          "updatedDate": 1757516927943,
          "acctnbr": "2047922",
          "bounced": false
      }
  ]
};

export enum MessageType {
	SMS = "SMS",
	EMAIL = "EMAIL",
	PUSH = "PUSH",
	H = "H",
	T = "T",
	C = "C",
	P = "P",
}

export interface IAlertsHistoryItem {
	messageType: MessageType;
	createdDate: number;
	status: string;
	message: string;
	subject: string;
	toContact: string;
	channelType: string;
}

export interface INotificationRecipientHistory {
	recipientId: string;
	recipientAddress: string;
	recipientParameters: string;
	messageType: string;
	subject: string;
	message: string;
	status: string;
	updatedDate: number;
	acctnbr: string;
	bounced: boolean;
}

export interface IAlertsHistoryData {
	responses: IAlertsHistoryItem[];
	bulkNotificationHistories: INotificationRecipientHistory[] | null;
}

export enum BulkNotificationStatus {
	N = "New",
	S = "Sent",
}
