document.addEventListener('DOMContentLoaded', () => {
    let timers = {};
    let startTimes = {};

    // مدیریت دکمه شروع
    document.querySelectorAll('.start-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const systemId = btn.dataset.id;
            const costPerSecond = parseFloat(btn.dataset.costPerSecond); // هزینه به ازای هر ثانیه
            if (isNaN(costPerSecond)) {
                alert('خطا: هزینه به ازای هر ثانیه نامعتبر است.');
                return;
            }

            // دریافت مدت زمان به دقیقه و تبدیل به ثانیه
            const durationInMinutes = prompt('مدت زمان استفاده را به دقیقه وارد کنید:');
            if (durationInMinutes && !isNaN(durationInMinutes)) {
                const totalTimeInSeconds = parseInt(durationInMinutes) * 60; // تبدیل دقیقه به ثانیه
                if (totalTimeInSeconds > 0) {
                    const startTime = new Date();
                    startTimes[systemId] = startTime;

                    const timerElement = document.getElementById(`timer-${systemId}`);
                    const timeDisplay = document.getElementById(`time-${systemId}`);
                    timerElement.style.display = 'block';

                    btn.style.display = 'none';
                    document.querySelector(`.end-btn[data-id="${systemId}"]`).style.display = 'inline-block';

                    let remainingTime = totalTimeInSeconds;
                    timers[systemId] = setInterval(() => {
                        remainingTime--;
                        const hours = Math.floor(remainingTime / 3600);
                        const minutes = Math.floor((remainingTime % 3600) / 60);
                        const seconds = remainingTime % 60;

                        timeDisplay.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

                        if (remainingTime <= 0) {
                            clearInterval(timers[systemId]);
                            alert('زمان استفاده به پایان رسید.');
                            timerElement.style.display = 'none';
                            document.querySelector(`.end-btn[data-id="${systemId}"]`).click();
                        }
                    }, 1000);

                    const start_time = startTime.toISOString().slice(0, 19).replace('T', ' ');
                    localStorage.setItem(`start_time_${systemId}`, start_time);
                } else {
                    alert('مدت زمان باید بیشتر از 0 باشد.');
                }
            }
        });
    });

    // مدیریت دکمه پایان
    document.querySelectorAll('.end-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const systemId = btn.dataset.id;

            clearInterval(timers[systemId]);
            const timerElement = document.getElementById(`timer-${systemId}`);
            timerElement.style.display = 'none';

            const endTime = new Date();
            const startTime = startTimes[systemId];
            if (!startTime) {
                alert('خطا: زمان شروع یافت نشد.');
                return;
            }

            // محاسبه زمان سپری شده به ثانیه
            const elapsedTimeInSeconds = Math.floor((endTime - startTime) / 1000);
            const costPerSecond = parseFloat(document.querySelector(`.start-btn[data-id="${systemId}"]`).dataset.costPerSecond);
            if (isNaN(costPerSecond)) {
                alert('خطا: هزینه به ازای هر ثانیه نامعتبر است.');
                return;
            }

            // محاسبه مبلغ بر اساس ثانیه
            const totalCost = (elapsedTimeInSeconds * costPerSecond).toFixed(2);

            console.log("زمان سپری شده (ثانیه):", elapsedTimeInSeconds);
            console.log("هزینه هر ثانیه:", costPerSecond);
            console.log("مبلغ کل:", totalCost);

            const start_time = localStorage.getItem(`start_time_${systemId}`);
            const end_time = endTime.toISOString().slice(0, 19).replace('T', ' ');

            const xhr = new XMLHttpRequest();
            xhr.open('POST', 'index.php', true);
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    alert(`مبلغ دریافتی: ${totalCost} تومان`);
                }
            };
            xhr.send(`save_record=true&system_id=${systemId}&start_time=${start_time}&end_time=${end_time}&total_cost=${totalCost}`);

            btn.style.display = 'none';
            document.querySelector(`.start-btn[data-id="${systemId}"]`).style.display = 'inline-block';
        });
    });

    // مدیریت ویرایش سیستم‌ها
    document.querySelectorAll('.edit-system-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('edit-id').value = btn.dataset.id;
            document.getElementById('name').value = btn.dataset.name;
            document.getElementById('last_service').value = btn.dataset.lastService;
            document.getElementById('cost_per_second').value = btn.dataset.costPerSecond; // هزینه به ازای ثانیه
            document.getElementById('edit-btn').style.display = 'inline-block';
        });
    });
});