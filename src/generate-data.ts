export const generateData = (numPoints: number): Marker[] => {
    const data = [];
    for (let i = 0; i < numPoints; i++) {
      const days_calving = (i / numPoints) * 640; // равномерное распределение X в диапазоне от 0 до 640
      const days_insemination = days_calving * 0.5 + Math.random() * 200 - 100; // увеличенный разброс по Y
      const abort = Math.random() > 0.75; // случайное значение для abort (true или false)
      const farm = Math.random() > 0.1 ? 'ТМФ' : 'Челны Бройлер';
      data.push({ days_calving, days_insemination, abort, farm });
    }
    return data;
  };

  export type Marker = {
    days_calving: number;
    days_insemination: number;
    abort: boolean;
    farm: string;
  };