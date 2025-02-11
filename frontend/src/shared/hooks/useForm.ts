import * as React from "react"
import { debounce } from "@/features/lib/utils"

export type ValidationRule<T> = {
  validate: (value: T) => boolean
  message: string
}

export type FieldConfig<T> = {
  initialValue: T
  rules?: ValidationRule<T>[]
  validateOnChange?: boolean
  autosave?: boolean
}

export type FormConfig<T extends Record<string, any>> = {
  fields: {
    [K in keyof T]: FieldConfig<T[K]>
  }
  onSubmit: (values: T) => Promise<void> | void
  onAutosave?: (values: Partial<T>) => Promise<void> | void
  autosaveDebounce?: number
}

export function useForm<T extends Record<string, any>>(config: FormConfig<T>) {
  const { fields, onSubmit, onAutosave, autosaveDebounce = 1000 } = config
  const [values, setValues] = React.useState<T>(() => {
    const initialValues = {} as T
    for (const [key, field] of Object.entries(fields)) {
      initialValues[key as keyof T] = field.initialValue
    }
    return initialValues
  })
  const [errors, setErrors] = React.useState<Partial<Record<keyof T, string>>>({})
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isDirty, setIsDirty] = React.useState(false)

  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const showMessage = (message: string, severity: 'success' | 'error') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  // Create a debounced autosave function
  const debouncedAutosave = React.useMemo(
    () =>
      debounce(async (valuesToSave: Partial<T>) => {
        try {
          await onAutosave?.(valuesToSave)
          showMessage("Your changes have been automatically saved.", "success")
        } catch (error) {
          showMessage("There was an error saving your changes.", "error")
        }
      }, autosaveDebounce),
    [onAutosave, autosaveDebounce]
  )

  // Validate a single field
  const validateField = (name: keyof T, value: T[keyof T]): string | null => {
    const fieldConfig = fields[name]
    if (!fieldConfig.rules) return null

    for (const rule of fieldConfig.rules) {
      if (!rule.validate(value)) {
        return rule.message
      }
    }
    return null
  }

  // Validate all fields
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof T, string>> = {}
    let isValid = true

    for (const [key, value] of Object.entries(values)) {
      const error = validateField(key as keyof T, value)
      if (error) {
        newErrors[key as keyof T] = error
        isValid = false
      }
    }

    setErrors(newErrors)
    return isValid
  }

  // Handle field change
  const handleChange = (name: keyof T, value: T[keyof T]) => {
    setValues((prev) => ({ ...prev, [name]: value }))
    setIsDirty(true)

    const fieldConfig = fields[name]
    if (fieldConfig.validateOnChange) {
      const error = validateField(name, value)
      setErrors((prev) => ({
        ...prev,
        [name]: error || undefined,
      }))
    }

    if (fieldConfig.autosave && onAutosave) {
      debouncedAutosave({ [name]: value } as Partial<T>)
    }
  }

  // Handle form submission
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()

    if (!validateForm()) {
      showMessage("Please fix the errors in the form.", "error")
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(values)
      setIsDirty(false)
      showMessage("Form submitted successfully.", "success")
    } catch (error) {
      showMessage("Failed to submit form. Please try again.", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Reset form to initial values
  const reset = () => {
    const initialValues = {} as T
    for (const [key, field] of Object.entries(fields)) {
      initialValues[key as keyof T] = field.initialValue
    }
    setValues(initialValues)
    setErrors({})
    setIsDirty(false)
  }

  return {
    values,
    errors,
    isDirty,
    isSubmitting,
    handleChange,
    handleSubmit,
    reset,
    validateField,
    validateForm,
    snackbar: {
      open: snackbar.open,
      message: snackbar.message,
      severity: snackbar.severity,
      handleClose: handleCloseSnackbar
    }
  }
}
