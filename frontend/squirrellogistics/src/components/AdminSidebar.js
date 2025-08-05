import React from "react";
import { Drawer, List, ListItem, ListItemText, ListItemButton } from "@mui/material";
import { useNavigate } from "react-router-dom";

const menuItems = [
  { label: "대시보드", path: "/dashboard" },
  {
    label: "관리",
    children: [
      { label: "사용자 관리", path: "/management/users" },
      { label: "차량 관리", path: "/management/vehicles" },
      { label: "배송 관리", path: "/management/deliveries" },
      { label: "정산 관리", path: "/management/settlement" },
    ],
  },
  {
    label: "고객지원",
    children: [
      { label: "공지사항", path: "/support/notices" },
      { label: "FAQ", path: "/support/faq" },
      { label: "1:1 문의", path: "/support/inquiry" },
      { label: "정책", path: "/support/policy" },
    ],
  },
];

const AdminSidebar = () => {
  const navigate = useNavigate();

  return (
    <Drawer variant="permanent" sx={{ width: 240, flexShrink: 0 }}>
      <List sx={{ width: 240, mt: 8 }}>
        {menuItems.map((item, idx) =>
          item.children ? (
            <React.Fragment key={idx}>
              <ListItem>
                <ListItemText primary={item.label} />
              </ListItem>
              {item.children.map((sub, i) => (
                <ListItemButton key={i} sx={{ pl: 4 }} onClick={() => navigate(sub.path)}>
                  <ListItemText primary={sub.label} />
                </ListItemButton>
              ))}
            </React.Fragment>
          ) : (
            <ListItemButton key={idx} onClick={() => navigate(item.path)}>
              <ListItemText primary={item.label} />
            </ListItemButton>
          )
        )}
      </List>
    </Drawer>
  );
};

export default AdminSidebar;
