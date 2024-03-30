import './ExploreContainer.css';

interface ContainerProps {
  long: string;
}

const ExploreContainer: React.FC<ContainerProps> = ({ long }) => {
  return (
    <div id="container">
      <strong>{long} long ngu nhu</strong>
      <p>Explore <a target="_blank" rel="noopener noreferrer" href="https://ionicframework.com/docs/components">UI Components</a></p>
    </div>
  );
};

export default ExploreContainer;
