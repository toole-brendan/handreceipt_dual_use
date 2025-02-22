import { PharmaceuticalShipment, ShipmentCondition } from '@/mocks/api/pharmaceuticals-shipments.mock';
import { ShipmentEvent } from './ShipmentTimeline';

export const createShipmentTimelineEvents = (shipment: PharmaceuticalShipment): ShipmentEvent[] => {
  const events: ShipmentEvent[] = [];

  // Add Departure Event
  if (shipment.actualDeparture) {
    const departureEvent: ShipmentEvent = {
      id: 'departure',
      timestamp: shipment.actualDeparture,
      type: 'Departure',
      location: {
        name: shipment.fromLocationId,
        coordinates: shipment.conditions[0]?.location ? {
          latitude: shipment.conditions[0].location.latitude,
          longitude: shipment.conditions[0].location.longitude
        } : undefined
      },
      blockchainData: {
        transactionHash: shipment.blockchainData.transactionHash,
        timestamp: shipment.blockchainData.timestamp,
        verified: shipment.blockchainData.verified
      }
    };
    events.push(departureEvent);
  }

  // Add Status Change Event
  if (shipment.status !== 'Preparing') {
    const statusEvent: ShipmentEvent = {
      id: 'status-change',
      timestamp: shipment.blockchainData.timestamp,
      type: 'Status Change',
      data: {
        newStatus: shipment.status
      },
      blockchainData: {
        transactionHash: shipment.blockchainData.transactionHash,
        timestamp: shipment.blockchainData.timestamp,
        verified: shipment.blockchainData.verified
      }
    };
    events.push(statusEvent);
  }

  // Add Condition Update Events
  shipment.conditions.forEach((condition, index) => {
    const conditionEvent: ShipmentEvent = {
      id: `condition-${index}`,
      timestamp: condition.timestamp,
      type: 'Condition Update',
      status: condition.status,
      location: condition.location ? {
        name: `Location Update ${index + 1}`,
        coordinates: {
          latitude: condition.location.latitude,
          longitude: condition.location.longitude
        }
      } : undefined,
      data: {
        condition: {
          ...condition,
          timestamp: condition.timestamp,
          status: condition.status
        }
      },
      blockchainData: {
        transactionHash: shipment.blockchainData.transactionHash,
        timestamp: condition.timestamp,
        verified: shipment.blockchainData.verified
      }
    };
    events.push(conditionEvent);
  });

  // Add Document Events
  shipment.documents.forEach((doc) => {
    const documentEvent: ShipmentEvent = {
      id: `doc-${doc.id}`,
      timestamp: shipment.blockchainData.timestamp,
      type: 'Document Added',
      data: {
        document: {
          id: doc.id,
          type: doc.type,
          name: doc.name,
          url: doc.url,
          verified: doc.verified
        }
      },
      blockchainData: {
        transactionHash: shipment.blockchainData.transactionHash,
        timestamp: shipment.blockchainData.timestamp,
        verified: doc.verified
      }
    };
    events.push(documentEvent);
  });

  // Add Arrival Event
  if (shipment.actualArrival) {
    const arrivalEvent: ShipmentEvent = {
      id: 'arrival',
      timestamp: shipment.actualArrival,
      type: 'Arrival',
      location: {
        name: shipment.toLocationId,
        coordinates: shipment.conditions[shipment.conditions.length - 1]?.location ? {
          latitude: shipment.conditions[shipment.conditions.length - 1].location!.latitude,
          longitude: shipment.conditions[shipment.conditions.length - 1].location!.longitude
        } : undefined
      },
      blockchainData: {
        transactionHash: shipment.blockchainData.transactionHash,
        timestamp: shipment.blockchainData.timestamp,
        verified: shipment.blockchainData.verified
      }
    };
    events.push(arrivalEvent);
  }

  // Sort events chronologically
  return events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
};
