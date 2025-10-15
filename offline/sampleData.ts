// Sample offline data used when registering with code 'OFFLINE'
export const SAMPLE_DEVICE = {
  id: 'offline-device-1',
  name: 'Device Offline',
  code: 'OFFLINE',
  site: {
    id: 'site-1',
    name: 'Site de Test',
    template: 'default'
  }
};

export const SAMPLE_SYNC = {
  site: {
    id: 'site-1',
    name: 'Site de Test',
    template: 'default'
  },
  parkings: [
    { id: 'p1', name: 'Parking Centre', location: 'Centre-ville' }
  ],
  perceptors: [
    { id: 'u1', username: undefined, userIdentifier: 'per1', password: '0000', person: { id: 'p1', name: 'Percepteur 1' } }
  ],
  supervisors: [
    { id: 's1', username: 'admin', userIdentifier: 'sup1', password: 'admin', person: { id: 's1', name: 'Superviseur' } }
  ],
  tarifications: [
    { id: 't1', name: 'Standard', amount: 100 }
  ]
};

export default { SAMPLE_DEVICE, SAMPLE_SYNC };
