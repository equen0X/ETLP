import ProgressBar
from "../components/ProgressBar";

function Progress() {

  const progressData = [
    {
      course: "Artificial Intelligence",
      progress: 80
    },
    {
      course: "Cloud Computing",
      progress: 60
    },
    {
      course: "Cyber Security",
      progress: 40
    }
  ];

  return (
    <div className="container mt-5">

      <h2>
        Course Progress
      </h2>

      {progressData.map((item,index) => (

        <div
          key={index}
          className="mb-4"
        >

          <h5>
            {item.course}
          </h5>

          <ProgressBar
            progress={item.progress}
          />

        </div>

      ))}

    </div>
  );
}

export default Progress;