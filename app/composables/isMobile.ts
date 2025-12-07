export const useIsMobile = () => {
  // Currently using tailwind's lg size
  const isMobile = useMediaQuery("(max-width: 64rem)")

  return { isMobile }
}
