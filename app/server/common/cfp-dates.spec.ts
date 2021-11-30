import { getCfpState } from './cfp-dates'

describe('#getCfpState', () => {
  beforeEach(() => {
    jest.useFakeTimers('modern')
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('For CONFERENCE', () => {
    it('is CLOSED if no cfp start or end are defined', () => {
      jest.setSystemTime(new Date('2020-02-27T13:00:00.000Z'))
      const state = getCfpState('CONFERENCE', null, null)

      expect(state).toBe('CLOSED')
    })

    it('is CLOSED if today is before cfp start', () => {
      jest.setSystemTime(new Date('2020-02-26T23:59:58.000Z'))
      const start = new Date('2020-02-27T00:00:00.000Z')
      const end = new Date('2020-02-27T23:59:59.000Z')

      const state = getCfpState('CONFERENCE', start, end)

      expect(state).toBe('CLOSED')
    })

    it('is OPENED if today between cfp start and end', () => {
      jest.setSystemTime(new Date('2020-02-27T23:59:58.000Z'))
      const start = new Date('2020-02-27T00:00:00.000Z')
      const end = new Date('2020-02-27T23:59:59.000Z')

      const state = getCfpState('CONFERENCE', start, end)

      expect(state).toBe('OPENED')
    })

    it('is FINISHED if today is after cfp end', () => {
      jest.setSystemTime(new Date('2020-02-28T00:00:00.000Z'))
      const start = new Date('2020-02-27T00:00:00.000Z')
      const end = new Date('2020-02-27T23:59:59.000Z')

      const state = getCfpState('CONFERENCE', start, end)

      expect(state).toBe('FINISHED')
    })
  })

  describe('For MEETUP', () => {
    it('is CLOSED if no cfp start or end are defined', () => {
      jest.setSystemTime(new Date('2020-02-27T13:00:00.000Z'))
      const state = getCfpState('MEETUP', null, null)

      expect(state).toBe('CLOSED')
    })

    it('is CLOSED if today is before cfp start', () => {
      jest.setSystemTime(new Date('2020-02-26T23:59:58.000Z'))
      const start = new Date('2020-02-27T00:00:00.000Z')

      const state = getCfpState('MEETUP', start)

      expect(state).toBe('CLOSED')
    })

    it('is OPENED if today between cfp start and end', () => {
      jest.setSystemTime(new Date('2020-02-27T23:59:58.000Z'))
      const start = new Date('2020-02-27T00:00:00.000Z')

      const state = getCfpState('MEETUP', start)

      expect(state).toBe('OPENED')
    })
  })
})
