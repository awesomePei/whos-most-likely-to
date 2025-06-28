// utils/clientId.ts
import { v4 as uuidv4 } from 'uuid';

export function getClientId() {
  let clientId = localStorage.getItem("clientId");
  if (!clientId) {
    clientId = uuidv4();
    localStorage.setItem("clientId", clientId);
  }
  return clientId;
}
