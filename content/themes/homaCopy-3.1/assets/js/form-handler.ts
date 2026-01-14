/**
 * Form Handler
 * ------------
 * Manages form submissions with loading states and error handling.
 * 
 * Features:
 * - Automatic form submission handling
 * - Loading state management
 * - Success/Error state handling
 * - FormData serialization
 */

export class FormHandler {
  static SELECTOR = "[data-form]";
  private form: HTMLFormElement;

  constructor(form: HTMLFormElement) {
    this.form = form;
    this.init();
  }

  private init(): void {
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
  }

  private async handleSubmit(event: Event): Promise<void> {
    event.preventDefault();
    
    try {
      // Add loading state
      this.form.classList.add('loading');
      this.form.classList.remove('success', 'error');

      // Get form data
      const formData = new FormData(this.form);
      
      // Send the request
      const response = await fetch(this.form.action, {
        method: this.form.method,
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Handle success
      this.form.classList.remove('loading');
      this.form.classList.add('success');
      this.form.reset();

    } catch (error) {
      // Handle error
      console.error('Form submission error:', error);
      this.form.classList.remove('loading');
      this.form.classList.add('error');
    }
  }
}
