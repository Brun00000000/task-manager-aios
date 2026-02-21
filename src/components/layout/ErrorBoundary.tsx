'use client'

import { Component, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'

interface Props { children: ReactNode }
interface State { hasError: boolean; message: string }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, message: '' }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-64 gap-4 text-center p-6">
          <p className="text-lg font-semibold text-gray-800">Algo deu errado</p>
          <p className="text-sm text-gray-500">{this.state.message}</p>
          <Button variant="outline" onClick={() => this.setState({ hasError: false, message: '' })}>
            Tentar novamente
          </Button>
        </div>
      )
    }
    return this.props.children
  }
}
