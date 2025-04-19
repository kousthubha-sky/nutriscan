import { useState } from "react"
import { Upload, Barcode, Package, Info, X } from "lucide-react"
import api from "../../services/api"
import { toast } from "react-toastify"
import { SuccessCheckmark } from "../ui/SuccessCheckmark"

export function ContributeSection() {
  const [formData, setFormData] = useState({
    productName: "",
    barcodeNumber: "",
    additionalInfo: "",
    productImage: null,
    barcodeImage: null
  })

  const [preview, setPreview] = useState({
    productImage: null,
    barcodeImage: null
  })

  const [showSuccess, setShowSuccess] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageChange = (e, type) => {
    const file = e.target.files[0]
    if (file) {
      setFormData(prev => ({
        ...prev,
        [type]: file
      }))
      setPreview(prev => ({
        ...prev,
        [type]: URL.createObjectURL(file)
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const submissionData = new FormData()
      submissionData.append('productName', formData.productName)
      submissionData.append('barcodeNumber', formData.barcodeNumber)
      submissionData.append('additionalInfo', formData.additionalInfo)
      if (formData.productImage) {
        submissionData.append('productImage', formData.productImage)
      }
      if (formData.barcodeImage) {
        submissionData.append('barcodeImage', formData.barcodeImage)
      }

      // Submit to backend
      await api.submitProduct(submissionData)

      // Show success animation
      setShowSuccess(true)

      // Reset form after delay
      setTimeout(() => {
        setShowSuccess(false)
        setFormData({
          productName: "",
          barcodeNumber: "",
          additionalInfo: "",
          productImage: null,
          barcodeImage: null
        })
        setPreview({
          productImage: null,
          barcodeImage: null
        })
      }, 1500)
    } catch (error) {
      console.error('Submission error:', error)
      toast.error("There was an error submitting your contribution. Please try again.")
    }
  }

  return (
    <section id="contribute" className="py-8 border-t border-gray-200 dark:border-gray-800">
      <SuccessCheckmark isVisible={showSuccess} />
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-2">Contribute Product Information</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Help improve our database by contributing product information. Please provide clear photos and accurate details.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <Package className="w-4 h-4" />
                Product Name*
              </label>
              <input
                type="text"
                name="productName"
                required
                className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                placeholder="Enter product name..."
                value={formData.productName}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <Barcode className="w-4 h-4" />
                Barcode Number*
              </label>
              <input
                type="text"
                name="barcodeNumber"
                required
                className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                placeholder="Enter barcode number..."
                value={formData.barcodeNumber}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2">Product Face Photo*</label>
              <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 flex flex-col items-center justify-center min-h-[150px] relative">
                {preview.productImage ? (
                  <div className="relative w-full h-[150px]">
                    <img
                      src={preview.productImage}
                      alt="Product preview"
                      className="w-full h-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPreview(prev => ({ ...prev, productImage: null }))
                        setFormData(prev => ({ ...prev, productImage: null }))
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-2">
                      Drag and drop product photo here, or click to browse
                    </p>
                    <input
                      type="file"
                      required={!formData.productImage}
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, 'productImage')}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2">Barcode Photo*</label>
              <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 flex flex-col items-center justify-center min-h-[150px] relative">
                {preview.barcodeImage ? (
                  <div className="relative w-full h-[150px]">
                    <img
                      src={preview.barcodeImage}
                      alt="Barcode preview"
                      className="w-full h-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPreview(prev => ({ ...prev, barcodeImage: null }))
                        setFormData(prev => ({ ...prev, barcodeImage: null }))
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-2">
                      Drag and drop barcode photo here, or click to browse
                    </p>
                    <input
                      type="file"
                      required={!formData.barcodeImage}
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, 'barcodeImage')}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </>
                )}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <Info className="w-4 h-4" />
                Additional Information
              </label>
              <textarea
                name="additionalInfo"
                className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 min-h-[150px]"
                placeholder="Enter any additional details about the product..."
                value={formData.additionalInfo}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <button
            type="submit"
            className="mt-6 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2 w-full md:w-auto"
          >
            <Upload className="w-4 h-4" />
            Submit Contribution
          </button>
        </form>
      </div>
    </section>
  )
}