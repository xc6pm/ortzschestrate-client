export default defineAppConfig({
  ui: {
    strategy: "override",
    input: {
      slots: {
        root: "w-full",
      },
    },
    card: {
      slots: {
        body: "p-3 sm:p-3",
        header: "p-3 sm:p-3",
        footer: "p-3 sm:p-3",
      },
    },
    selectMenu: {
      slots: {
        base: "w-full",
      },
    },
  },
})
