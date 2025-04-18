import { useState } from "react"
import { Upload } from "lucide-react"

export function ContributeSection() {
  const [additionalInfo, setAdditionalInfo] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle submission logic here
    console.log("Submitted info:", additionalInfo)
    setAdditionalInfo("")
    alert("Thank you for your contribution!")
  }

  return (
    <section id="contribute" className="py-8 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-2">Contribute Additional Information</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Help improve our database by contributing additional information about this product.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Additional Information</label>
              <textarea
                className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 min-h-[150px]"
                placeholder="Enter any corrections or additional details..."
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Upload Product Image</label>
              <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 flex flex-col items-center justify-center min-h-[150px]">
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-center text-gray-500 dark:text-gray-400">
                  Drag and drop image here, or click to browse
                </p>
                <button type="button" className="mt-4 text-sm text-green-600 dark:text-green-500">
                  Upload Image
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="mt-6 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
          >
            Submit Contribution
          </button>
        </form>
      </div>
    </section>
  )
}