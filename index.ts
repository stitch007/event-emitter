type Callback<T = any> = (args: T) => void

class EventEmitter<Events extends Record<keyof any, any>> {
  private map: Map<keyof Events, Set<Callback>> = new Map()

  on<Name extends keyof Events>(name: Name, cb: Callback<Events[Name]>) {
    let cbs = this.map.get(name)
    !cbs && this.map.set(name, cbs = new Set())
    cbs.add(cb)
  }

  emit<Name extends keyof Events>(name: Name, args: Events[Name]) {
    let cbs = this.map.get(name)
    if (!cbs) return
    cbs.forEach(cb => cb(args))
  }

  off<Name extends keyof Events>(name?: Name, cb?: Callback<Events[Name]>) {
    if (!name) {
      this.map.clear()
      return
    }
    if (!cb) {
      this.map.delete(name)
      return
    }
    const cbs = this.map.get(name)
    cbs && cbs.delete(cb)
  }

  once<Name extends keyof Events>(name: Name, cb: Callback<Events[Name]>) {
    const one: Callback<Events[Name]> = (args) => {
      cb(args)
      this.off(name, one)
    }
    this.on(name, one)
  }
}

const emitter = new EventEmitter<{
  911: [string, number]
  helloworld: string
}>()

emitter.on(911, ([str, num]) => console.log(`911事件被触发: ${str} ${num}`))
// 911事件被触发: foo 110
emitter.emit(911, ['foo', 110])

const fn = ([str, num]: [string, number]) => {
  console.log(`911事件又被触发了: ${str} ${num}`)
}
emitter.on(911, fn)
// 911事件被触发: bar 120
// 911事件又被触发了: bar 120
emitter.emit(911, ['bar', 120])
emitter.off(911, fn)
// 911事件被触发: foo bar 119
emitter.emit(911, ['foo bar', 119])
emitter.off(911)

emitter.once('helloworld', (str) => console.log(`hello ${str}`))
// hello world
emitter.emit('helloworld', 'world')
emitter.emit('helloworld', 'world')
