document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, looking for modal elements...');
  
  const modal = document.getElementById('create-modal');
  const btn = document.getElementById('create');
  const span = document.querySelector('.close');
  
  console.log('Modal:', modal);
  console.log('Button:', btn);
  console.log('Close span:', span);
  
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
