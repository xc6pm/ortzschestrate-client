import { Blob } from "node:buffer"

export default defineEventHandler(async (event) => {
  const form = await readMultipartFormData(event)
  if (!form) throw createError({ statusCode: 400, statusMessage: "Invalid form data" })

  const getField = (name: string) => form.find((d) => d.name === name)
  const getFieldValue = (name: string) => getField(name)?.data.toString("utf-8")

  const fileField = getField("file")
  const name = getFieldValue("name")
  const description = getFieldValue("description") ?? ""
  const attributesRaw = getFieldValue("attributes") ?? "[]"

  if (!fileField?.data || !fileField.type) {
    throw createError({ statusCode: 400, statusMessage: "Missing image file" })
  }
  if (!name) {
    throw createError({ statusCode: 400, statusMessage: "Missing name" })
  }

  const pinataJwt = useRuntimeConfig().pinataJwt
  if (!pinataJwt) {
    throw createError({ statusCode: 500, statusMessage: "Pinata JWT not configured" })
  }

  const imageBlob = new Blob([fileField.data], { type: fileField.type }) as unknown as globalThis.Blob
  const imageForm = new FormData()
  imageForm.append("file", imageBlob, fileField.filename ?? "image")
  imageForm.append("name", `${name}-img`)
  imageForm.append("network", "public")

  const imageUploadRes = await $fetch<{ data: PinataUploadResponse }>("https://uploads.pinata.cloud/v3/files", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${pinataJwt}`,
    },
    body: imageForm,
  })

  const metadata = {
    name,
    description,
    image: `ipfs://${imageUploadRes.data.cid}`,
    attributes: JSON.parse(attributesRaw),
  }

  const metadataBlob = new Blob([JSON.stringify(metadata)], { type: "application/json" }) as unknown as globalThis.Blob
  const metadataForm = new FormData()
  metadataForm.append("file", metadataBlob, "metadata.json")
  metadataForm.append("name", `${name}-metadata`)
  metadataForm.append("network", "public")

  const metadataUploadRes = await $fetch<{ data: PinataUploadResponse }>("https://uploads.pinata.cloud/v3/files", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${pinataJwt}`,
    },
    body: metadataForm,
  })

  return { cid: metadataUploadRes.data.cid }
})

interface PinataUploadResponse {
  id: string
  group_id: string | null
  name: string
  cid: string
  created_at: string
  size: number
  number_of_files: number
  mime_type: string
  vectorized: false
  network: "public" | "private"
  keyvalues: { [key: string]: string }
}
