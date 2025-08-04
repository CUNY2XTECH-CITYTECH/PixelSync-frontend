document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, looking for modal elements...');
  
  const modal = document.getElementById('create-modal');
  const btn = document.getElementById('create');
  const span = document.querySelector('.close');
  const tagsInput = document.getElementById('tags-input');
  
  console.log('Modal:', modal);
  console.log('Button:', btn);
  console.log('Close span:', span);
  console.log('Tags input:', tagsInput);
  
  // Example: Change placeholder text dynamically
  if (tagsInput) {
    // Uncomment and modify the line below to change the placeholder:
    // tagsInput.placeholder = "Enter tags like: math, science, history";
  }
  
  if (!btn) {
    console.error('Button with id "create" not found!');
    return;
  }
  
  if (!modal) {
    console.error('Modal with id "create-modal" not found!');
    return;
  }
  
  btn.onclick = () => {
    console.log('Button clicked!');
    modal.style.display = 'block';
  };
  
  if (span) {
    span.onclick = () => {
      console.log('Close button clicked!');
      modal.style.display = 'none';
    };
  }
  
  window.onclick = (event) => {
    if (event.target === modal) {
      console.log('Clicked outside modal');
      modal.style.display = 'none';
    }
  };
});
