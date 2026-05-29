export const useIsMobile = (preferMobileInSSR = true) => {
  let isMobile
  if (import.meta.server) {
    isMobile = computed(() => preferMobileInSSR)
  } else {
    // Currently using tailwind's lg size
    isMobile = useMediaQuery("(max-width: 64rem)")
  }

  return { isMobile }
}
