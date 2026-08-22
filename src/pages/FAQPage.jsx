import { Collapse, Card } from 'antd';
import { faqs } from '../data/dummyData';
import './FAQPage.css';

function FAQPage() {
  return (
    <div className="page-shell">
      <section className="section-card">
        <h2 className="section-title">Frequently Asked Questions</h2>
        <Card>
          <Collapse items={faqs.map((item) => ({ key: item.question, label: item.question, children: <p>{item.answer}</p> }))} />
        </Card>
      </section>
    </div>
  );
}

export default FAQPage;
